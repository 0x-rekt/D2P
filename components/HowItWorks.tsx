import React from "react";

const HowItWorks = () => {
  return (
    <section className="relative border-t border-white/5 bg-black px-6 py-24 sm:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Streamlined for{" "}
            <span className="bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              simplicity
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400 lg:text-lg leading-relaxed">
            Set up once, and let AI operate in the background. A completely
            seamless review process that integrates directly into your existing
            workflow.
          </p>
        </div>

        <div className="grid gap-16 md:grid-cols-3">
          <div className="group relative text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500/20 to-transparent border border-blue-500/30 text-4xl font-black text-blue-400 shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] transition-transform duration-300 group-hover:scale-110">
              1
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white transition-colors group-hover:text-blue-200">
              Connect Repository
            </h3>
            <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
              Log in securely with GitHub and select the specific repositories
              you want D2P to monitor.
            </p>
            <div className="hidden md:block absolute top-[3rem] left-[65%] w-[70%] border-t-2 border-dashed border-white/10" />
            <div className="hidden md:block absolute top-[3rem] left-[65%] w-0 border-t-2 border-dashed border-blue-500 transition-all duration-700 group-hover:w-[70%]" />
          </div>

          <div className="group relative text-center md:translate-y-8">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-purple-500/20 to-transparent border border-purple-500/30 text-4xl font-black text-purple-400 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] transition-transform duration-300 group-hover:scale-110">
              2
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white transition-colors group-hover:text-purple-200">
              AI Analyzes PRs
            </h3>
            <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
              Whenever a pull request is opened, our AI triggers automatically,
              reviewing code diffs for flaws and improvements.
            </p>
            <div className="hidden md:block absolute top-[3rem] left-[65%] w-[70%] border-t-2 border-dashed border-white/10" />
            <div className="hidden md:block absolute top-[3rem] left-[65%] w-0 border-t-2 border-dashed border-purple-500 transition-all duration-700 group-hover:w-[70%]" />
          </div>

          <div className="group relative text-center md:translate-y-16">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-500/20 to-transparent border border-emerald-500/30 text-4xl font-black text-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] transition-transform duration-300 group-hover:scale-110">
              3
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white transition-colors group-hover:text-emerald-200">
              Apply Fixes
            </h3>
            <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
              Review suggested enhancements. With a single click, apply
              actionable code fixes straight to your branch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
