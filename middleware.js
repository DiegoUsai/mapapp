import { auth } from "@/lib/auth";

export default auth((req) => {
  // Le rotte di autenticazione e gli asset statici sono già esclusi dal matcher.
  // Qui, se non c'è utente autenticato, NextAuth reindirizza a /signin (pagina configurata).
  if (!req.auth) {
    const url = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
