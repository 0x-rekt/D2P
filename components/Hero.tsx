"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, GitPullRequest, Terminal } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import SignInBtn from "@/components/SignInBtn";

const Hero = () => {
  const { data: session } = useSession();

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-[#030303] py-24 lg:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-100 w-100 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-8 animate-fade-in">
            <Badge
              variant="outline"
              className="gap-2 border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-400 backdrop-blur-md transition-colors hover:border-blue-500/30"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>Revolutionizing Pull Requests</span>
            </Badge>
          </div>

          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Code reviews, <br />
                <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                  evolved with D2P
                </span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
                Ship cleaner code faster. D2P acts as an automated senior
                engineer, auditing your PRs for logic flaws and security risks
                before they hit production.
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  {
                    icon: GitPullRequest,
                    label: "Real-time PR Audits",
                    desc: "Instant feedback on every commit.",
                  },
                  {
                    icon: Sparkles,
                    label: "Contextual AI",
                    desc: "Suggestions that understand your stack.",
                  },
                ].map((feature, i) => (
                  <div key={i} className="group flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors group-hover:border-blue-500/50">
                      <feature.icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{feature.label}</p>
                      <p className="text-sm text-zinc-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                {session ? (
                  <Button
                    size="lg"
                    className="group h-14 rounded-full bg-blue-600 px-8 text-base font-bold transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  >
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Go to Dashboard{" "}
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </Button>
                ) : (
                  <div className="h-14">
                    <SignInBtn />
                  </div>
                )}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-[22px] bg-linear-to-r from-blue-500/20 to-indigo-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0C] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/50 px-5 py-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Terminal size={14} />
                    <span>D2P-Agent — pr-review-patch-1</span>
                  </div>
                  <div className="w-12" /> {/* Spacer */}
                </div>

                {/* Content */}
                <div className="p-6 font-mono text-[13px] leading-relaxed">
                  <div className="flex gap-4 opacity-50">
                    <span className="w-4 text-zinc-600">1</span>
                    <span className="text-zinc-300">
                      <span className="text-blue-400">import</span>{" "}
                      {"{ analyze }"}{" "}
                      <span className="text-blue-400">from</span> "@d2p/core";
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-4 text-zinc-600">2</span>
                    <span className="text-zinc-300">
                      <span className="text-blue-400">async function</span>{" "}
                      <span className="text-yellow-400">initReview</span>(){" "}
                      {"{"}
                    </span>
                  </div>
                  <div className="flex gap-4 bg-red-500/10">
                    <span className="w-4 text-red-500/50">-</span>
                    <span className="text-red-200">
                      {" "}
                      const data = fetchApi();
                    </span>
                  </div>
                  <div className="flex gap-4 bg-green-500/10">
                    <span className="w-4 text-green-500/50">+</span>
                    <span className="text-green-200">
                      {" "}
                      const data = await fetchApi();
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-4 text-zinc-600">5</span>
                    <span className="text-zinc-300">{"}"}</span>
                  </div>

                  {/* AI Tooltip Overlay */}
                  <div className="mt-8 rounded-xl border border-blue-500/40 bg-blue-600/10 p-5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Optimized suggestion
                        </span>
                      </div>
                      <Badge className="bg-blue-500/20 text-[10px] text-blue-300 border-none hover:bg-blue-500/20">
                        98% Confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-200">
                      Missing <code className="text-blue-300">await</code>{" "}
                      keyword. This will cause the function to return a Promise
                      instead of data.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button
                        size="sm"
                        className="h-8 bg-blue-600 px-4 text-xs font-semibold hover:bg-blue-500"
                      >
                        Apply Fix
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5"
                      >
                        Ignore
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
