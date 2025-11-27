import { inngest } from "@selectio/jobs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { vacancyId } = await request.json();

    if (!vacancyId) {
      return NextResponse.json(
        { error: "vacancyId is required" },
        { status: 400 }
      );
    }

    await inngest.send({
      name: "vacancy/responses.refresh",
      data: { vacancyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error triggering vacancy responses refresh:", error);
    return NextResponse.json(
      { error: "Failed to trigger refresh" },
      { status: 500 }
    );
  }
}
