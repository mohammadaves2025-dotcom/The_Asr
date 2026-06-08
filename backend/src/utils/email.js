const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; background: #f5f2ed; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-top: 4px solid #122837; }
    .header { background: #122837; padding: 24px 32px; }
    .logo { color: #fff; font-size: 22px; font-weight: 700; }
    .logo span { color: #FBFC09; }
    .body { padding: 32px; color: #0d1a22; line-height: 1.7; }
    .btn { display: inline-block; background: #122837; color: #FBFC09; padding: 12px 28px;
           text-decoration: none; font-family: sans-serif; font-weight: 700; font-size: 13px;
           letter-spacing: 1px; text-transform: uppercase; margin: 20px 0; }
    .footer { padding: 16px 32px; border-top: 1px solid #e5e0d8;
              font-family: sans-serif; font-size: 11px; color: #8a9aa5; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><div class="logo">The Orbis Journal<span>.</span></div></div>
    <div class="body">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} The Orbis Journal · Independent. Rights. Accountability.</div>
  </div>
</body>
</html>`;

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: baseTemplate(html),
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
};

const sendWelcomeEmail = (to, name) =>
  sendEmail({
    to,
    subject: 'Welcome to The Orbis Journal Media',
    html: `<h2>Welcome, ${name}.</h2>
      <p>Thank you for joining The Orbis Journal Media — independent journalism covering human rights,
      minorities, and accountability across India.</p>
      <p>You can now read, comment, save articles, and support our newsroom.</p>
      <a href="${process.env.CLIENT_URL}" class="btn">Read Today's Stories →</a>`,
  });

const sendPasswordResetEmail = (to, name, resetUrl) =>
  sendEmail({
    to,
    subject: 'Reset your The Orbis Journal password',
    html: `<h2>Password reset request</h2>
      <p>Hi ${name}, we received a request to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" class="btn">Reset Password →</a>
      <p style="font-size:12px;color:#8a9aa5">If you didn't request this, please ignore this email.</p>`,
  });

const sendNewsletterConfirmEmail = (to, confirmUrl) =>
  sendEmail({
    to,
    subject: 'Confirm your The Orbis Journal Dispatch subscription',
    html: `<h2>One click to confirm</h2>
      <p>You're almost subscribed to The The Orbis Journal Dispatch — our weekly digest of the most
      important rights and accountability stories.</p>
      <a href="${confirmUrl}" class="btn">Confirm Subscription →</a>`,
  });

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewsletterConfirmEmail,
};
