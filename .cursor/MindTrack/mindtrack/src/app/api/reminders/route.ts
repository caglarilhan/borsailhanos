import { NextResponse, headers } from "next/server";
import { createBrowserClient } from "@supabase/ssr";
import { sendEmail } from "@/lib/email";

export async function GET() {
  // Basic token guard (cron secret)
  const authHeader = headers().get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        client:clients(name, email, phone)
      `)
      .eq("date", tomorrowStr)
      .eq("status", "confirmed");

    if (error) {
      console.error("Error fetching appointments:", error);
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }

    // Send reminders
    const results = [];
    for (const appointment of appointments) {
      try {
        await sendEmail({
          to: appointment.client.email,
          subject: "Appointment Reminder",
          text: `Hi ${appointment.client.name}, this is a reminder for your appointment tomorrow at ${appointment.time}.`
        });
        results.push({ id: appointment.id, status: "sent" });
      } catch (emailError) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, emailError);
        results.push({ id: appointment.id, status: "failed", error: emailError.message });
      }
    }

    return NextResponse.json({
      message: "Reminders processed",
      total: appointments.length,
      results
    });

  } catch (error) {
    console.error("Reminders API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


