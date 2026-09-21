import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

const ADMIN_ONLY_PREFIXES = [
  "/usuarios",
  "/configuracion",
  "/reportes",
  "/proveedores",
  "/compras",
  "/gastos",
  "/promociones",
];

const PUBLIC_PREFIXES = ["/catalogo", "/login"];

/**
 * Edge-safe auth config (no Prisma/bcrypt here) — shared by middleware and
 * the full server-side config in lib/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    // Pure field-copying — no Prisma/bcrypt — so these are edge-safe and must
    // be shared with middleware.ts's own NextAuth() instance. Without them
    // here, the middleware's `auth.user.role` is always undefined, which
    // silently treats every logged-in admin as non-admin on admin-only
    // routes (see project memory: giftflow gotchas).
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // API routes handle their own auth (requireSession) and must return
      // JSON errors, not an HTML redirect to /login — never intercept them
      // here, including NextAuth's own /api/auth/* endpoints.
      if (pathname.startsWith("/api/")) {
        return true;
      }

      const isLoggedIn = !!auth?.user;
      const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (!isLoggedIn && !isPublic) {
        return false;
      }

      if (
        isLoggedIn &&
        auth?.user.role !== "ADMIN" &&
        ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
      ) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
