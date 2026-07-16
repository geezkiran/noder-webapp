"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { me } from "@/lib/api/auth";
import { setAccessToken } from "@/lib/api/client";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applyTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiresIn = searchParams.get("expires_in");

    if (!accessToken || !refreshToken) {
      setError("Sign-in didn't complete — missing tokens from the redirect.");
      return;
    }

    (async () => {
      try {
        // We only have the tokens from the query string, not the user object —
        // fetch it once so AuthContext has a fully-populated user immediately.
        setAccessToken(accessToken);
        const user = await me();
        await applyTokens({
          user,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: "Bearer",
          expires_in: Number(expiresIn) || 900,
        });
        router.replace("/");
      } catch {
        setError("Signed in, but couldn't load your profile. Try refreshing.");
      }
    })();
  }, [searchParams, applyTokens, router]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-[0.5px] border-gray-300 bg-neutral-50 p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-[#0a0a0a]">
      {error ? (
        <p className="text-sm text-error-primary">{error}</p>
      ) : (
        <p className="text-sm text-tertiary">Finishing sign-in…</p>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
