"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api/types";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";

// The auth screens always sit on a light video backdrop, so they use explicit
// theme-stable colors instead of semantic tokens (which flip in dark mode).
const inputStyles = {
  className: "**:data-label:text-gray-700 [&_[slot=description]]:text-gray-600",
  inputClassName: "text-gray-900 placeholder:text-gray-500",
  wrapperClassName: "rounded-xl bg-white/50 shadow-none ring-[0.5px] ring-white backdrop-blur-md hover:bg-white/60",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ email, username, password, display_name: displayName || undefined });
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600">Join Noder and start building your feed.</p>
      </div>

      <form className="flex flex-col gap-3.5 sm:gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          isRequired
          hideRequiredIndicator
          placeholder="you@example.com"
          {...inputStyles}
        />
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          isRequired
          hideRequiredIndicator
          placeholder="yourname"
          hint="Letters, numbers, and underscores only"
          {...inputStyles}
        />
        <Input
          label="Display name"
          type="text"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Your Name (optional)"
          {...inputStyles}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          isRequired
          hideRequiredIndicator
          placeholder="At least 8 characters"
          {...inputStyles}
        />

        {error && <p className="text-center text-sm text-error-600">{error}</p>}

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full justify-center rounded-2xl bg-brand-700 before:rounded-xl hover:bg-brand-800">
          Create account →
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
