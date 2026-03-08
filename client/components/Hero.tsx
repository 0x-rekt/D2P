"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Code2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import SignInBtn from "@/components/SignInBtn";

const Hero = () => {
  const { data: session } = useSession();
  return (
    <section className="relative overflow-hidden bg-black py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 -z-10 h-150 w-250 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="container mx-auto px-6 text-center">
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="gap-2 border-blue-500/30 bg-blue-500/5 px-4 py-1.5 text-blue-400 backdrop-blur-sm"
          >
            <Sparkles size={14} />
            <span>AI-Powered Code Intelligence</span>
          </Badge>
        </div>

        <h1 className="mb-6 bg-linear-to-b from-white to-gray-500 bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent sm:text-7xl">
          Automate your code reviews <br /> with{" "}
          <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            D2P
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400">
          Connect your GitHub repositories in seconds. D2P analyzes every Pull
          Request, suggests high-impact improvements, and lets you apply fixes
          with a single click.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {session ? (
            <Button
              size="lg"
              className="h-12 gap-2 bg-blue-600 px-8 font-semibold hover:bg-blue-700"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Get Started <ArrowRight size={16} />
              </Link>
            </Button>
          ) : (
            <SignInBtn />
          )}
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-2 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-white/5 bg-zinc-950 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/50" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            <div className="ml-4 flex items-center gap-2 text-xs font-medium text-gray-500">
              <Code2 size={14} />
              <span>pr_reviewer.py</span>
            </div>
          </div>
          <div className="h-75 w-full bg-zinc-900/30 p-6 text-left font-mono text-sm sm:h-100">
            <div className="flex gap-4">
              <span className="text-zinc-600">1</span>
              <span className="text-blue-400">def</span>{" "}
              <span className="text-yellow-400">analyze_pr</span>(payload):
            </div>
            <div className="flex gap-4">
              <span className="text-zinc-600">2</span>
              <span className="ml-4 text-gray-300">
                diff = payload.get(
                <span className="text-green-400">"diff"</span>)
              </span>
            </div>
            <div className="mt-4 flex flex-col rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-400">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Suggestion
                </span>
              </div>
              <p className="text-blue-100/80 italic">
                "Use list comprehension here to improve readability and
                performance."
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 bg-blue-500 text-[10px] hover:bg-blue-600"
                >
                  Apply Fix
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] text-gray-400"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
