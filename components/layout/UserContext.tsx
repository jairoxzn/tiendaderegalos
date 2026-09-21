"use client";

import { createContext, useContext } from "react";
import type { Role } from "@prisma/client";

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
}

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside <UserProvider>");
  return ctx;
}

export function useIsAdmin() {
  return useCurrentUser().role === "ADMIN";
}
