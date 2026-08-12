"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#F5F6F3" }}>
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 text-center" style={{ borderColor: "#E2DFD6" }}>
        <div className="mb-1 text-[12px] font-medium tracking-wide" style={{ color: "#8A8578", fontFamily: "'IBM Plex Mono', monospace" }}>
          REGIONE SARDEGNA · ECOSISTEMA DOCUMENTALE
        </div>
        <h1 className="mb-6 text-xl font-semibold" style={{ color: "#232019", fontFamily: "'IBM Plex Serif', serif" }}>
          Mappa applicativa e dei requisiti
        </h1>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full rounded-md py-2.5 text-[14px] font-medium text-white"
          style={{ backgroundColor: "#1B2430" }}
        >
          Accedi con Google
        </button>
        <p className="mt-4 text-[12px]" style={{ color: "#8A8578" }}>
          Accesso riservato agli account autorizzati.
        </p>
      </div>
    </div>
  );
}
