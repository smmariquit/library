"use client";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium text-amber-700">Personal Library</p>
      <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
        Your books, ready when you are.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-stone-600">
        Sign in to upload a PDF, organize your library, and pick up where you left off.
      </p>
    </main>
  );
}
