"use client";
import posthog from "posthog-js";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function PostHogIdentify() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      posthog.identify(session.user.email, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session]);

  return null;
}
