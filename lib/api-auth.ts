import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export class ApiAuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** Throws ApiAuthError if there's no active session, optionally requiring a role. */
export async function requireSession(allowedRoles?: Role[]) {
  const session = await auth();
  if (!session?.user) {
    throw new ApiAuthError(401, "No autorizado. Inicia sesión nuevamente.");
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new ApiAuthError(403, "No tienes permisos para realizar esta acción.");
  }
  return session;
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json(
    { error: "Ocurrió un error inesperado. Inténtalo nuevamente." },
    { status: 500 },
  );
}
