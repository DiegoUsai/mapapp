"use client";
import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "./posthog";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </SessionProvider>
  );
}
