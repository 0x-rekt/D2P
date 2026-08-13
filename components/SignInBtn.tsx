"use client";

import { authClient } from "@/lib/auth-client";
import { Github } from "lucide-react";

const SignInBtn = () => {
  const handleClick = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <button
      onClick={handleClick}
      className="btn-gradient-teal flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold cursor-pointer"
    >
      <Github size={15} />
      Sign in with GitHub
    </button>
  );
};

export default SignInBtn;
