import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { CreateUserInput, UpdateUserInput } from "@/schemas/user";

export async function listUsers() {
  return db.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
}

export async function createUser(input: CreateUserInput) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("Ya existe un usuario con ese correo.");

  const passwordHash = await bcrypt.hash(input.password, 10);
  return db.user.create({
    data: { name: input.name, email: input.email, passwordHash, role: input.role, active: input.active },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const existing = await db.user.findFirst({ where: { email: input.email, NOT: { id } } });
  if (existing) throw new Error("Ya existe otro usuario con ese correo.");

  return db.user.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      active: input.active,
      ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 10) } : {}),
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
}

export async function toggleUserActive(id: string, currentUserId: string) {
  if (id === currentUserId) throw new Error("No puedes desactivar tu propia cuenta.");
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  return db.user.update({ where: { id }, data: { active: !user.active } });
}
