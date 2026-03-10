"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

const SignInBtn = () => {
  const handleClick = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Button
      variant="outline"
      className="border-white/10 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
      onClick={handleClick}
    >
      Sign in with GitHub
    </Button>
  );
};

export default SignInBtn;
