const nodemailer = require('nodemailer');

// In no-auth mode SMTP is optional — create transporter lazily so missing
// env vars don't crash the server on startup.
const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const sendPasswordReset = (to, token) => {
  const transporter = getTransporter();
  if (!transporter) return Promise.resolve(); // silently skip if SMTP not configured
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'BiasMap — Reset your password',
    text: `Reset your password: ${frontendUrl}/reset-password?token=${token}\n\nExpires in 30 minutes.`,
  });
};

module.exports = { sendPasswordReset };
