"use client";
import { SessionProvider } from "next-auth/react";
import { PostHogIdentify } from "./posthog";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <PostHogIdentify />
      {children}
    </SessionProvider>
  );
}
