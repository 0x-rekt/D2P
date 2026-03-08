"use client";

import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import SignInBtn from "@/components/SignInBtn";
import { Button } from "./ui/button";
import Image from "next/image";

const NavBar = () => {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-md dark:bg-black/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter text-primary"
          >
            D2P<span className="text-blue-500">.</span>
          </Link>
        </div>

        <div className="hidden md:block">
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {session && (
              <Link
                href="/dashboard"
                className="transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Image
                src={session.user.image || "/default-avatar.png"}
                alt={session.user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="text-black hover:bg-gray-200 cursor-pointer"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <SignInBtn />
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
