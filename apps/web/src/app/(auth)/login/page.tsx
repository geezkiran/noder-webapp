"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { googleAuthUrl } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { GoogleLogo } from "@/components/icons/google-logo";

// The auth screens always sit on a light video backdrop, so they use explicit
// theme-stable colors instead of semantic tokens (which flip in dark mode).
const inputStyles = {
  className: "**:data-label:text-gray-700",
  inputClassName: "text-gray-900 placeholder:text-gray-500",
  wrapperClassName: "rounded-xl bg-white/50 shadow-none ring-[0.5px] ring-white backdrop-blur-md hover:bg-white/60",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleAuthUrl();
      if (result.configured && result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setError(result.message ?? "Google sign-in isn't configured.");
        setIsGoogleLoading(false);
      }
    } catch {
      setError("Couldn't reach Google sign-in. Try again.");
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back to Noder!</h1>
        <p className="mt-1 text-sm text-gray-600">Please enter your details to sign in your account</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          color="secondary"
          size="lg"
          isLoading={isGoogleLoading}
          onClick={handleGoogle}
          iconLeading={GoogleLogo}
          className="w-full justify-center rounded-2xl bg-white text-gray-700 shadow-none ring-[0.5px] ring-white before:rounded-2xl hover:bg-gray-50 hover:text-gray-800"
        >
          Continue with Google
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-xs text-gray-600">Or sign in with</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          isRequired
          hideRequiredIndicator
          placeholder="johndoe@mail.com"
          {...inputStyles}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          isRequired
          hideRequiredIndicator
          placeholder="minimum 8 character"
          {...inputStyles}
        />

        {error && <p className="text-center text-sm text-error-600">{error}</p>}

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full justify-center rounded-2xl bg-brand-700 before:rounded-xl hover:bg-brand-800">
          Sign In →
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
        >
          Forgot password?
        </Link>
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
