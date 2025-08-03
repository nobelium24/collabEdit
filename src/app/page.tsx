// src/app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-background text-foreground">
      <main className="flex flex-col gap-10 row-start-2 items-center text-center max-w-2xl">
        <span className="text-2xl font-bold tracking-tight text-primary">
          CollabEdit
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          Real-time Collaboration. Effortless Editing.
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
          <strong>CollabEdit</strong> lets you create, edit, and collaborate on files in real time —
          whether you're coding, writing documentation, or brainstorming ideas. Built for speed,
          simplicity, and seamless teamwork. Still in beta, but ready for you to try!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <Link
            href="/signup"
            className="rounded-full bg-foreground text-background font-medium py-3 px-6 text-sm sm:text-base hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-black/[.08] dark:border-white/[.15] text-foreground py-3 px-6 text-sm sm:text-base hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Log In
          </Link>
        </div>
      </main>

      <footer className="row-start-3 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} CollabEdit. Built with ❤️ by Developers for Developers.</span>
      </footer>
    </div>
  );
}
