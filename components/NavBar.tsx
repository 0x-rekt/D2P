"use client";

import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import SignInBtn from "@/components/SignInBtn";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Sparkles,
  Layers,
  Zap,
  LogOut,
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
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-black/75 shadow-lg shadow-black/30 backdrop-blur-2xl"
            : "border-b border-transparent bg-black/20 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xl font-black tracking-tighter"
            >
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                D2P
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_2px_rgba(59,130,246,0.6)]" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden md:flex items-center gap-1"
          >
            {navLinks.map((link, i) => {
              const Icon = link.icon;
              const active = (
                "active" in link ? link.active : isActive(link.href)
              ) as boolean;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon size={14} />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <div className="h-8 w-24 rounded-full bg-white/5 animate-pulse" />
            ) : session ? (
              <>
                {/* Avatar pill */}
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3">
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt={session.user.name}
                    width={26}
                    height={26}
                    className="rounded-full ring-1 ring-blue-500/40"
                  />
                  <span className="text-xs font-medium text-gray-300 max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSignOut}
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer h-8 gap-1.5 rounded-full border border-white/10 px-3 text-gray-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <LogOut size={13} />
                    <span className="hidden sm:inline text-xs font-medium">Sign Out</span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <SignInBtn />
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400 hover:bg-white/10 hover:text-white transition-all md:hidden"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={16} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: 288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 288, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="absolute right-0 top-16 w-72 rounded-bl-2xl border-b border-l border-white/[0.08] bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    pathname === "/"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                      : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Home size={15} />
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
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                          : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="my-3 border-t border-white/[0.08]" />

              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 px-3 py-2">
                    <Image
                      src={session.user.image || "/default-avatar.png"}
                      alt={session.user.name}
                      width={28}
                      height={28}
                      className="rounded-full ring-1 ring-blue-500/40"
                    />
                    <span className="text-sm font-medium text-gray-300 truncate">
                      {session.user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/15 transition-all"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <SignInBtn />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
