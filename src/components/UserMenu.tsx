'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-blue-400 animate-pulse"></div>;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="hidden md:block bg-white text-blue-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-sm font-bold">
            {session.user?.name?.charAt(0) || '?'}
          </div>
        )}
        <span className="text-sm">{session.user?.name}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{session.user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={() => {
                setShowMenu(false);
                signOut({ callbackUrl: '/login' });
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
