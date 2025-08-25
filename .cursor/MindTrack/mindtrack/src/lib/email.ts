import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  return new Resend(apiKey);
}

export async function sendReminderEmail(to: string, subject: string, text: string) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM || "reminder@mindtrack.app";
  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) throw error;
}


