import { db } from "@/lib/db";
import type { BusinessSettingsInput } from "@/schemas/settings";

export async function getBusinessSettings() {
  const existing = await db.businessSettings.findFirst();
  if (existing) return existing;
  return db.businessSettings.create({ data: { storeName: "GiftFlow" } });
}

export async function updateBusinessSettings(input: BusinessSettingsInput) {
  const existing = await getBusinessSettings();
  return db.businessSettings.update({
    where: { id: existing.id },
    data: {
      storeName: input.storeName,
      ruc: input.ruc || null,
      address: input.address || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      logoUrl: input.logoUrl || null,
      receiptFooterText: input.receiptFooterText || null,
    },
  });
}
