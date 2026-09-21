import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { businessSettingsSchema } from "@/schemas/settings";
import { getBusinessSettings, updateBusinessSettings } from "@/services/settings";

export async function GET() {
  try {
    await requireSession(["ADMIN"]);
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
