/**
 * Resend Email Service
 * Handles all email sending via Resend API
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "Toko Yasin <noreply@tokoyasin.com>", // Change to your verified domain
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

// Helper function to check if email service is configured
export function isEmailConfigured() {
  return !!process.env.RESEND_API_KEY;
}
