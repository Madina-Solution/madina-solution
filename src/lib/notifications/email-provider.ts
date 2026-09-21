/**
 * Provider-agnostic transactional email abstraction.
 * Supports Resend (HTTPS API, no SMTP dependency) and Gmail (SMTP via nodemailer,
 * using a Google Account App Password).
 */
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export interface EmailProvider {
  send(payload: EmailPayload): Promise<EmailResult>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(payload: EmailPayload): Promise<EmailResult> {
    console.log(`[EMAIL:DEV] To: ${payload.to} | Subject: ${payload.subject}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  async send(payload: EmailPayload): Promise<EmailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = payload.from || process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      throw new Error("RESEND_API_KEY and EMAIL_FROM are required");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      throw new Error(data.message || `Email provider returned ${response.status}`);
    }

    return { success: true, messageId: data.id };
  }
}

export class GmailEmailProvider implements EmailProvider {
  readonly name = "gmail";

  async send(payload: EmailPayload): Promise<EmailResult> {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    const from = payload.from || process.env.EMAIL_FROM || user;
    if (!user || !pass) {
      throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are required");
    }

    // Lazy import so nodemailer is only pulled in when the Gmail provider is actually selected.
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    try {
      const info = await transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Gagal mengirim email melalui Gmail");
    }
  }
}

export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER || "console").toLowerCase();

  if (provider === "resend") return new ResendEmailProvider();
  if (provider === "gmail" || provider === "google") return new GmailEmailProvider();
  if (provider === "console" && process.env.NODE_ENV !== "production") return new ConsoleEmailProvider();

  throw new Error(
    `Unsupported or unconfigured EMAIL_PROVIDER='${provider}'. Configure EMAIL_PROVIDER=resend (RESEND_API_KEY + EMAIL_FROM) or EMAIL_PROVIDER=gmail (GMAIL_USER + GMAIL_APP_PASSWORD).`
  );
}
