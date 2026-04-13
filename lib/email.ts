import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.zoho.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "noreply@commerce.lk";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://commerce.lk";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Commerce.lk";

// ── Shared HTML wrapper ──────────────────────────────────────────────────────
function wrapEmail(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #2563EB, #1D4ED8); padding: 32px; text-align: center;">
            <div style="display: inline-block; background: white; border-radius: 12px; padding: 8px 20px;">
              <span style="font-size: 20px; font-weight: 800; color: #111827; font-family: sans-serif;">
                Commerce<span style="color: #2563EB;">.lk</span>
              </span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="text-align: center; padding: 24px; background: #F9FAFB; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 12px; font-family: sans-serif; margin: 0 0 8px;">
              © 2026 Commerce.lk · Sri Lanka's #1 A/L Commerce Platform
            </p>
            <a href="${SITE_URL}" style="color: #2563EB; font-size: 12px; font-family: sans-serif; text-decoration: none;">
              Visit Website
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Welcome Email ────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">
      Welcome to ${SITE_NAME}, ${name}!
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
      You've joined thousands of A/L Commerce students who are already boosting their results with our resources.
    </p>

    <div style="background:#eff6ff;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#2563EB;">Getting Started Tips</h3>
      <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:2;">
        <li>Browse resources by subject — Accounting, Business Studies, Economics & more</li>
        <li>Filter by medium (Sinhala / Tamil / English) for your language</li>
        <li>Download past papers and model papers for free</li>
        <li>Complete your profile to unlock personalized content</li>
      </ul>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${SITE_URL}/subjects"
         style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: sans-serif;">
        Browse Subjects →
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      Need help? Reply to this email and we'll get back to you.
    </p>
  `;

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${FROM}>`,
    to,
    subject: `Welcome to ${SITE_NAME}!`,
    html: wrapEmail(`Welcome to ${SITE_NAME}`, body),
  });
}

// ── Email Verification ───────────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, name: string, otp: string) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">
      Verify Your Email Address
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${name}, enter the 6-digit code below to verify your email address. The code expires in <strong>24 hours</strong>.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#F0F7FF;border:2px dashed #2563EB;border-radius:12px;padding:20px 40px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#2563EB;letter-spacing:1px;text-transform:uppercase;">Your Verification Code</p>
        <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#2563EB;">${otp}</p>
      </div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/verify-email?otp=${otp}&email=${encodeURIComponent(to)}"
         style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: sans-serif;">
        Verify Email Address →
      </a>
    </div>

    <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-top: 24px;">
      <p style="color: #DC2626; font-size: 13px; margin: 0; font-family: sans-serif;">
        <strong>Notice:</strong> If you didn't create an account on ${SITE_NAME}, please ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${FROM}>`,
    to,
    subject: `Verify your email — ${SITE_NAME}`,
    html: wrapEmail("Email Verification", body),
  });
}

// ── Contact Form Notification ────────────────────────────────────────────────
export async function sendContactEmail(opts: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  const { name, email, type, message } = opts;

  // Notification to the team
  const teamBody = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">
      New Contact Message
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
      A visitor submitted the contact form on ${SITE_NAME}.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        ["Name", name],
        ["Email", `<a href="mailto:${email}" style="color:#2563EB;">${email}</a>`],
        ["Type", type],
      ]
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#475569;width:120px;">${label}</td>
          <td style="padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">${value}</td>
        </tr>`
        )
        .join("")}
    </table>

    <div style="background:#f8fafc;border-left:4px solid #2563EB;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
      <p style="margin:0;font-size:14px;color:#1e293b;white-space:pre-wrap;line-height:1.7;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    </div>

    <div style="text-align:center;">
      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(type)} — ${SITE_NAME}"
         style="display: inline-block; background: #2563EB; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; font-family: sans-serif;">
        Reply to ${name} →
      </a>
    </div>
  `;

  // Auto-reply to the sender
  const replyBody = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">
      We received your message
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${name}, thank you for getting in touch. We have received your message and will get back to you as soon as possible.
    </p>

    <div style="background:#eff6ff;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#2563EB;text-transform:uppercase;letter-spacing:0.5px;">Your message</p>
      <p style="margin:0;font-size:14px;color:#1e293b;white-space:pre-wrap;line-height:1.7;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#64748b;line-height:1.6;">
      Expected response time: <strong style="color:#1e293b;">2–3 business days</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      If your matter is urgent, you can also reach us directly at
      <a href="mailto:hello@commerce.lk" style="color:#2563EB;text-decoration:none;">hello@commerce.lk</a>.
    </p>
  `;

  await Promise.all([
    transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM}>`,
      to: "hello@commerce.lk",
      replyTo: email,
      subject: `[Contact] ${type} — ${name}`,
      html: wrapEmail("New Contact Message", teamBody),
    }),
    transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM}>`,
      to: email,
      subject: `We received your message — ${SITE_NAME}`,
      html: wrapEmail("Message Received", replyBody),
    }),
  ]);
}

// ── Resource Request Status Changed ─────────────────────────────────────────
export async function sendRequestStatusEmail(opts: {
  to: string;
  userName: string;
  resourceTitle: string;
  status: "fulfilled" | "rejected";
  adminNote?: string;
}) {
  const { to, userName, resourceTitle, status, adminNote } = opts;
  const fulfilled = status === "fulfilled";

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">
      ${fulfilled ? "Your request has been fulfilled!" : "Update on your resource request"}
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${userName}, we have an update on your resource request.
    </p>

    <div style="background:${fulfilled ? "#F0F7FF" : "#fef2f2"};border:1px solid ${fulfilled ? "#bfdbfe" : "#fecaca"};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${fulfilled ? "#2563EB" : "#991b1b"};text-transform:uppercase;letter-spacing:0.5px;">
        ${fulfilled ? "Fulfilled" : "Not available"}
      </p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">${resourceTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    </div>

    ${adminNote ? `
    <div style="background:#f8fafc;border-left:4px solid #94a3b8;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Note from our team</p>
      <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;">${adminNote.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    </div>` : ""}

    ${fulfilled ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${SITE_URL}/subjects"
         style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: sans-serif;">
        Browse Resources →
      </a>
    </div>` : `
    <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">
      We weren't able to source this material at this time. You're welcome to submit a new request in the future.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/requests"
         style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: sans-serif;">
        Submit Another Request →
      </a>
    </div>`}
  `;

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${FROM}>`,
    to,
    subject: fulfilled
      ? `Your request was fulfilled — ${SITE_NAME}`
      : `Update on your resource request — ${SITE_NAME}`,
    html: wrapEmail(
      fulfilled ? "Request Fulfilled" : "Request Update",
      body
    ),
  });
}

// ── New Resource Alert ───────────────────────────────────────────────────────
export async function sendNewResourceAlert(opts: {
  to: string;
  userName: string;
  resourceTitle: string;
  subjectName: string;
  categoryName: string;
  medium: string;
  resourceUrl: string;
}) {
  const { to, userName, resourceTitle, subjectName, categoryName, medium, resourceUrl } = opts;
  const mediumLabel = medium.charAt(0).toUpperCase() + medium.slice(1);

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">
      New resource added
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${userName}, a new resource has been added for one of your subscribed subjects.
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#1e293b;">${resourceTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <table cellpadding="0" cellspacing="0">
        ${[
          ["Subject",  subjectName],
          ["Category", categoryName],
          ["Medium",   mediumLabel],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:3px 12px 3px 0;font-size:13px;color:#64748b;font-weight:600;">${label}</td>
            <td style="padding:3px 0;font-size:13px;color:#1e293b;">${value}</td>
          </tr>`).join("")}
      </table>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="${resourceUrl}"
         style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: sans-serif;">
        View &amp; Download →
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      You're receiving this because you subscribed to <strong>${subjectName}</strong> alerts.
      <a href="${SITE_URL}/profile" style="color:#2563EB;text-decoration:none;">Manage preferences →</a>
    </p>
  `;

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${FROM}>`,
    to,
    subject: `New ${subjectName} resource — ${resourceTitle} | ${SITE_NAME}`,
    html: wrapEmail("New Resource Alert", body),
  });
}

// ── Password Reset ───────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}`;
  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">
      Reset Your Password
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${name}, we received a request to reset the password for your ${SITE_NAME} account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}"
         style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: sans-serif;">
        Reset Password →
      </a>
    </div>

    <p style="margin:0 0 16px;font-size:13px;color:#64748b;text-align:center;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#2563EB;text-align:center;word-break:break-all;">
      ${resetUrl}
    </p>

    <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-top: 24px;">
      <p style="color: #DC2626; font-size: 13px; margin: 0; font-family: sans-serif;">
        <strong>Security Notice:</strong> If you didn't request this, please ignore this email. This link expires in 1 hour.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${FROM}>`,
    to,
    subject: `Password reset request — ${SITE_NAME}`,
    html: wrapEmail("Reset Your Password", body),
  });
}
