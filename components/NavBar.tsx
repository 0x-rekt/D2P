"use client";

import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import SignInBtn from "@/components/SignInBtn";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Sparkles,
  Layers,
  Zap,
  Github,
} from "lucide-react";

const NavBar = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const isLanding = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isRepoPage = pathname.startsWith("/dashboard/repos");

  const landingLinks = [
    { label: "How It Works", href: "/#how-it-works", icon: Layers },
    { label: "Features", href: "/#features", icon: Sparkles },
    { label: "Get Started", href: "/#cta", icon: Zap },
  ];

  const appLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: isDashboard || isRepoPage,
    },
  ];

  const navLinks = session
    ? [...(isLanding ? landingLinks : []), ...appLinks]
    : landingLinks;

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-black/90 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-transparent bg-black/60 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-2xl font-bold tracking-tighter text-white transition-transform hover:scale-105"
          >
            <span>
              D2P
              <span className="text-blue-500 transition-colors group-hover:text-blue-400">
                .
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active =
                "active" in link ? link.active : isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={15}
                    className={active ? "text-blue-400" : "text-gray-500"}
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-800" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3">
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt={session.user.name}
                    width={28}
                    height={28}
                    className="rounded-full ring-2 ring-blue-500/30"
                  />
                  <span className="hidden text-sm font-medium text-gray-300 sm:block max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                </div>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                  className="cursor-pointer border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <SignInBtn />
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-16 w-72 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-bl-2xl border-b border-l border-white/10 bg-gray-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-5 duration-200">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  pathname === "/"
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Home
                  size={16}
                  className={
                    pathname === "/" ? "text-blue-400" : "text-gray-500"
                  }
                />
                Home
              </Link>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active =
                  "active" in link ? link.active : isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-500/15 text-blue-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={active ? "text-blue-400" : "text-gray-500"}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="my-3 border-t border-white/10" />
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
