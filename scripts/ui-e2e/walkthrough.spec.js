import { expect, test } from "@playwright/test";

const WEB = "http://localhost:3000";
const MAILPIT = "http://localhost:8025";
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";

async function mailLink(page, subject, email) {
  const response = await page.request.get(`${MAILPIT}/api/v1/messages`);
  expect(response.ok()).toBeTruthy();
  const { messages } = await response.json();
  const message = messages.find(
    (item) =>
      item.Subject === subject &&
      item.To.some((to) => to.Address.toLowerCase() === email.toLowerCase()),
  );
  expect(message, `Mailpit message "${subject}" for ${email}`).toBeTruthy();

  const detail = await page.request.get(`${MAILPIT}/api/v1/message/${message.ID}`);
  expect(detail.ok()).toBeTruthy();
  const body = await detail.json();
  const text = body.Text ?? body.HTML ?? "";
  const match = text.match(/https?:\/\/[^\s<"]+/);
  expect(match, "email contains a link").toBeTruthy();
  return match[0].replace(/&amp;/g, "&");
}

test.describe("Personal Library UI walkthrough", () => {
  test("demo login → library → read PDF → update status", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole("heading", { name: "My library" })).toBeVisible();
    await expect(page.getByText(/book(s)? on your shelf/i)).toBeVisible();

    const firstBook = page.locator("a.book-card").first();
    await expect(firstBook).toBeVisible();
    const bookTitle = (await firstBook.textContent())?.trim() ?? "";
    expect(bookTitle.length).toBeGreaterThan(0);
    await firstBook.click();

    await expect(page.getByRole("button", { name: /Read PDF|Reload PDF/ })).toBeVisible();
    await page.getByRole("button", { name: /Read PDF|Reload PDF/ }).click();

    const reader = page.locator('iframe[title^="PDF Reader for"]');
    await expect(reader).toBeVisible();
    await expect(reader).toHaveAttribute("src", /^blob:/);

    await page.locator("#reading_status").selectOption("finished");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible();
  });

  test("signup → Mailpit verify → library empty state", async ({ page }) => {
    const email = `ui-${Date.now()}@example.com`;
    const password = "password123";

    await page.goto("/signup");
    await page.getByLabel("Name").fill("UI Walkthrough");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/verify\/pending/);
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText(`We sent a verification link to ${email}.`)).toBeVisible();

    const verifyUrl = await mailLink(page, "Verify your Library email", email);
    expect(verifyUrl).toContain(`${WEB}/verify`);

    await page.goto(verifyUrl);
    await expect(page.getByRole("heading", { name: "Your email is verified" })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Open your library" }).click();

    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole("heading", { name: "Your shelf is empty." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Add your first book/i })).toBeVisible();
  });

  test("forgot password → Mailpit reset → sign in with new password", async ({ page }) => {
    const email = `reset-ui-${Date.now()}@example.com`;
    const oldPassword = "password123";
    const newPassword = "newpassword123";

    await page.goto("/signup");
    await page.getByLabel("Name").fill("Reset UI");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(oldPassword);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/verify\/pending/);

    const verifyUrl = await mailLink(page, "Verify your Library email", email);
    await page.goto(verifyUrl);
    await expect(page.getByRole("heading", { name: "Your email is verified" })).toBeVisible({ timeout: 20_000 });

    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();

    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send reset email" }).click();
    await expect(page).toHaveURL(/\/reset-password\/pending/);
    await expect(page.getByText(`We sent a password reset link to ${email}.`)).toBeVisible();

    const resetUrl = await mailLink(page, "Reset your Library password", email);
    expect(resetUrl).toContain(`${WEB}/reset-password`);

    await page.goto(resetUrl);
    await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    await page.locator("#password").fill(newPassword);
    await page.locator("#confirmPassword").fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Password updated. You can now sign in.")).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(newPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole("heading", { name: "Your shelf is empty." })).toBeVisible();
  });
});
