"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/tasks" className="text-lg font-bold">
          ✅ TaskFlow
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
                pathname === "/admin" ? "text-blue-600 dark:text-blue-400" : ""
              }`}
            >
              Admin
            </Link>
          )}
          <ThemeToggle />
          {user && (
            <>
              <span className="hidden text-sm text-gray-500 sm:inline">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
