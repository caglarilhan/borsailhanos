"use client";

import Link from "next/link";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";

export default function AuthNav() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user?.email;

  const content = (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
        Dashboard
      </Link>
      <Link href="/admin" className="text-gray-600 hover:text-gray-900">
        Admin
      </Link>
      {isAuthed ? (
        <>
          <span className="hidden sm:inline text-gray-500">
            {session!.user!.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Sign in
        </button>
      )}
    </div>
  );

  // Provide session locally to avoid wrapping the entire server tree
  return <SessionProvider>{content}</SessionProvider>;
}


