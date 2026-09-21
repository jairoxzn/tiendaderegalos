import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { businessSettingsSchema } from "@/schemas/settings";
import { getBusinessSettings, updateBusinessSettings } from "@/services/settings";

export async function GET() {
  try {
    // Any signed-in staff can read the store name/logo (needed for receipts,
    // the catalog dashboard, etc.) — only editing settings is admin-only.
    await requireSession();
    const settings = await getBusinessSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = businessSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const settings = await updateBusinessSettings(parsed.data);
    return NextResponse.json(settings);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
