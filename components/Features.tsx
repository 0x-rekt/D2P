import {
  Zap,
  GitMerge,
  FileCode2,
  Lock,
  Shield,
  ArrowRight,
} from "lucide-react";

const featuresData = [
  {
    icon: <GitMerge className="text-blue-400" size={26} />,
    title: "Seamless GitHub Integration",
    description:
      "Connect your repositories with one click. D2P listens to your webhooks and monitors every new PR seamlessly.",
  },
  {
    icon: <Zap className="text-amber-400" size={26} />,
    title: "Instant AI Analysis",
    description:
      "Advanced LLMs review code changes instantly, catching bugs and performance issues before they hit production.",
  },
  {
    icon: <FileCode2 className="text-emerald-400" size={26} />,
    title: "One-Click Fixes",
    description:
      "Don't just get comments—get actionable code diffs that you can test and apply directly to your branches instantly.",
  },
  {
    icon: <Shield className="text-indigo-400" size={26} />,
    title: "Best Practices Implemented",
    description:
      "Ensure your team adheres to modern industry standards. D2P acts as a tireless senior engineer on every PR.",
  },
  {
    icon: <Lock className="text-rose-400" size={26} />,
    title: "Secure & Private",
    description:
      "Your code never leaves your secure environment permanently. We analyze and discard without retaining proprietary logic.",
  },
  {
    icon: <ArrowRight className="text-cyan-400" size={26} />,
    title: "Continuous Learning",
    description:
      "D2P learns from your codebase's context over time, adapting its suggestions to match your unique coding style.",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative px-6 py-24 sm:py-32 bg-zinc-950 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-black to-black border-y border-white/5"></div>

      <div className="container relative mx-auto max-w-7xl">
        <div className="mb-20 space-y-4 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
            Powerful features for{" "}
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              modern teams
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400 text-lg sm:text-xl">
            Everything you need to ship high-quality code faster, eliminating
            the mental overhead of tedious manual reviews.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 transition-all hover:-translate-y-1 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-6 inline-flex rounded-2xl bg-zinc-800/80 p-4 shadow-inner ring-1 ring-white/10 transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-tight text-gray-100">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-400 text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
