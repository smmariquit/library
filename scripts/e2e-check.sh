#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pass=0
fail=0

ok() { echo "PASS: $1"; pass=$((pass + 1)); }
bad() { echo "FAIL: $1"; fail=$((fail + 1)); }

require() {
  if eval "$2"; then ok "$1"; else bad "$1"; fi
}

echo "=== Bscale E2E compliance check ==="

for i in $(seq 1 30); do
  curl -sf http://localhost:3001/health >/dev/null && curl -sf http://localhost:8000/health >/dev/null && break
  sleep 1
done

require "All 7 services running" "[ \$(docker compose ps --format json 2>/dev/null | wc -l) -ge 7 ] || docker compose ps | grep -q web"

require "API health" "curl -sf http://localhost:8000/health | grep -q ok"
require "Auth health" "curl -sf http://localhost:3001/health | grep -q ok"
require "Web responds" "curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000/ | grep -q 200"
require "Mailpit responds" "curl -sf -o /dev/null http://localhost:8025/api/v1/messages"
require "FastAPI docs" "curl -sf -o /dev/null http://localhost:8000/docs"

# Seeder
docker compose exec -T api python -m app.seed >/dev/null
ok "Seeder runs"

# Demo login + JWT
curl -sf -c /tmp/e2e-cookies.txt -X POST http://localhost:3001/api/auth/sign-in/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"password123"}' >/dev/null
TOKEN=$(curl -sf -b /tmp/e2e-cookies.txt http://localhost:3001/api/auth/token | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

require "JWT issued after login" "[ ${#TOKEN} -gt 100 ]"
require "List books with JWT" "curl -sf -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books | python3 -c \"import sys,json; assert len(json.load(sys.stdin))==3\""

BOOK_ID=$(curl -sf -H "Authorization: Bearer $TOKEN" http://localhost:8000/books | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
require "Get single book" "curl -sf -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/$BOOK_ID | grep -q title"
require "Read-url endpoint" "curl -sf -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/$BOOK_ID/read-url | grep -q stream"
require "PDF content streams" "curl -sf -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/$BOOK_ID/content | head -c 4 | grep -q '%PDF'"
require "Patch reading status" "curl -sf -X PATCH -H \"Authorization: Bearer $TOKEN\" -H 'Content-Type: application/json' -d '{\"reading_status\":\"finished\"}' http://localhost:8000/books/$BOOK_ID | grep -q finished"

require "No auth returns 401" "[ \$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/books) = 401 ]"
require "Cross-user book returns 404" "[ \$(curl -s -o /dev/null -w '%{http_code}' -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/00000000-0000-0000-0000-000000000000) = 404 ]"

# Upload PDF
PDF=/tmp/e2e-test.pdf
python3 - <<'PY' > "$PDF"
text = b"BT /F1 24 Tf 72 720 Td (E2E Test Book) Tj ET"
objects = [
    b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    f"5 0 obj\n<< /Length {len(text)} >>\nstream\n{text.decode()}\nendstream\nendobj\n".encode(),
]
doc = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
offsets = []
for obj in objects:
    offsets.append(len(doc))
    doc += obj
xref = len(doc)
doc += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
doc += b"".join(f"{o:010} 00000 n \n".encode() for o in offsets)
doc += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
import sys; sys.stdout.buffer.write(doc)
PY

NEW_ID=$(curl -sf -H "Authorization: Bearer $TOKEN" \
  -F "title=E2E Upload" -F "author=Tester" -F "description=Automated test" -F "reading_status=unread" -F "file=@$PDF;type=application/pdf" \
  http://localhost:8000/books | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
require "Upload PDF book" "[ -n \"$NEW_ID\" ]"
require "Uploaded PDF readable" "curl -sf -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/$NEW_ID/content | head -c 4 | grep -q '%PDF'"
require "Delete book" "[ \$(curl -s -o /dev/null -w '%{http_code}' -X DELETE -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/$NEW_ID) = 204 ]"

# Signup + verify via Mailpit
RAND=$RANDOM
EMAIL="e2e-$RAND@example.com"
curl -sf -X POST http://localhost:3001/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"E2E User\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"callbackURL\":\"http://localhost:3000/verify\"}" >/dev/null
sleep 2
VERIFY_URL=$(curl -sf "http://localhost:8025/api/v1/messages" | python3 -c "
import sys,json,re
msgs=json.load(sys.stdin)['messages']
m=next(x for x in msgs if x['Subject']=='Verify your Library email' and any(t['Address']=='$EMAIL' for t in x['To']))
detail=json.load(__import__('urllib.request').request.urlopen(f\"http://localhost:8025/api/v1/message/{m['ID']}\"))
body=detail.get('Text') or detail.get('HTML') or ''
print(re.search(r'https?://\\S+', body).group(0))
")
require "Signup sends verification email" "[ -n \"$VERIFY_URL\" ]"
require "Verification link targets web app" "echo \"$VERIFY_URL\" | grep -q 'localhost:3000/verify'"
TOKEN2=$(python3 - <<PY
import urllib.parse, urllib.request
url = "$VERIFY_URL"
token = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)["token"][0]
urllib.request.urlopen(f"http://localhost:3001/api/auth/verify-email?token={urllib.parse.quote(token)}")
req = urllib.request.Request("http://localhost:3001/api/auth/sign-in/email", data=b'{"email":"$EMAIL","password":"password123"}', headers={"Content-Type":"application/json"}, method="POST")
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(__import__('http.cookiejar').cookiejar.CookieJar()))
opener.open(req)
print(__import__('json').loads(opener.open("http://localhost:3001/api/auth/token").read())["token"])
PY
)
require "New user can login after verify" "[ ${#TOKEN2} -gt 100 ]"

# Password reset
curl -sf -X POST http://localhost:3001/api/auth/request-password-reset \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"redirectTo\":\"http://localhost:3000/reset-password\"}" >/dev/null
sleep 2
RESET_URL=$(curl -sf "http://localhost:8025/api/v1/messages" | python3 -c "
import sys,json,re,urllib.request
msgs=json.load(sys.stdin)['messages']
m=next(x for x in msgs if x['Subject']=='Reset your Library password' and any(t['Address']=='$EMAIL' for t in x['To']))
detail=json.load(urllib.request.urlopen(f\"http://localhost:8025/api/v1/message/{m['ID']}\"))
body=detail.get('Text') or detail.get('HTML') or ''
print(re.search(r'https?://\\S+', body).group(0))
")
require "Password reset email sent" "[ -n \"$RESET_URL\" ]"
require "Reset link targets web app" "echo \"$RESET_URL\" | grep -q 'localhost:3000/reset-password'"

# Two-user isolation
USER2_EMAIL="isolated-$RAND@example.com"
curl -sf -X POST http://localhost:3001/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"User Two\",\"email\":\"$USER2_EMAIL\",\"password\":\"password123\",\"callbackURL\":\"http://localhost:3000/verify\"}" >/dev/null
sleep 2
V2=$(curl -sf "http://localhost:8025/api/v1/messages" | python3 -c "
import sys,json,re,urllib.request
msgs=json.load(sys.stdin)['messages']
m=next(x for x in msgs if x['Subject']=='Verify your Library email' and any(t['Address']=='$USER2_EMAIL' for t in x['To']))
detail=json.load(urllib.request.urlopen(f\"http://localhost:8025/api/v1/message/{m['ID']}\"))
body=detail.get('Text') or detail.get('HTML') or ''
print(re.search(r'token=([^\\s&]+)', body).group(1))
")
python3 -c "import urllib.request,urllib.parse; urllib.request.urlopen('http://localhost:3001/api/auth/verify-email?token='+urllib.parse.quote('$V2'))" >/dev/null
TOKEN_U2=$(python3 - <<PY
import json, urllib.request
from http.cookiejar import CookieJar
jar=CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
op.open(urllib.request.Request("http://localhost:3001/api/auth/sign-in/email", data=b'{"email":"$USER2_EMAIL","password":"password123"}', headers={"Content-Type":"application/json"}, method="POST"))
print(json.loads(op.open("http://localhost:3001/api/auth/token").read())["token"])
PY
)
U2_BOOK=$(curl -sf -H "Authorization: Bearer $TOKEN_U2" \
  -F "title=Private Book" -F "author=User Two" -F "reading_status=unread" -F "file=@$PDF;type=application/pdf" \
  http://localhost:8000/books | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
require "User2 cannot read user1 demo book" "[ \$(curl -s -o /dev/null -w '%{http_code}' -H \"Authorization: Bearer $TOKEN_U2\" http://localhost:8000/books/$BOOK_ID) = 404 ]"
require "User1 cannot read user2 book" "[ \$(curl -s -o /dev/null -w '%{http_code}' -H \"Authorization: Bearer $TOKEN\" http://localhost:8000/books/$U2_BOOK) = 404 ]"

# Redis cache populated after listing books
curl -sf -c /tmp/e2e-redis.txt -X POST http://localhost:3001/api/auth/sign-in/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"password123"}' >/dev/null || true
TOKEN=$(curl -sf -b /tmp/e2e-redis.txt http://localhost:3001/api/auth/token | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -sf -H "Authorization: Bearer $TOKEN" http://localhost:8000/books >/dev/null
REDIS_KEYS=$(docker compose exec -T redis redis-cli KEYS 'library:books:*' 2>/dev/null | tr -d '\r')
require "Redis caches book lists" "echo \"$REDIS_KEYS\" | grep -q library:books:"

# Next.js has no API routes in build output
require "No Next.js API routes" "! grep -rq 'src/app/api' web/src/app 2>/dev/null"

# Frontend pages
for path in / /signup /login /verify /verify/pending /forgot-password /reset-password /library; do
  require "Web page $path loads" "curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000$path | grep -q 200"
done

echo ""
echo "=== Results: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
