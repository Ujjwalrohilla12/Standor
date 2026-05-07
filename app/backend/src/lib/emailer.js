import nodemailer from "nodemailer";

export async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal for local dev/testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendMail({ to, subject, text, html }) {
  try {
    if (process.env.RESEND_API_KEY) {
      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || "Standor <onboarding@resend.dev>",
          to: Array.isArray(to) ? to : [to],
          subject,
          text,
          html,
        }),
      });

      const resendData = await resendResp.json().catch(() => ({}));
      if (!resendResp.ok) {
        throw new Error(resendData?.message || "Resend API request failed");
      }

      return { success: true, provider: "resend", info: resendData };
    }

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'Standor <no-reply@standor.local>',
      to,
      subject,
      text,
      html,
    });

    // If using Ethereal, return preview URL for debugging
    const preview = nodemailer.getTestMessageUrl(info);
    return { success: true, provider: "smtp", info, preview };
  } catch (err) {
    console.error('Error sending mail:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}
