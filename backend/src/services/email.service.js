import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const transporter = !resend
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

async function send({ email, subject, html }) {
  if (resend) {
    const { error } = await resend.emails.send({ from: FROM, to: email, subject, html });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  return transporter.sendMail({ to: email, subject, html });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;

  return send({
    email,
    subject: 'Activate your account',
    html: `<h1>Activate account</h1><a href="${href}">${href}</a>`,
  });
}

function sendConfirmEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;

  return send({
    email,
    subject: 'Confirm email change',
    html: `<h1>Confirm changing Email</h1><a href="${href}">${href}</a>`,
  });
}

function sendEmailChanged(oldEmail, newEmail) {
  return send({
    email: oldEmail,
    subject: 'Your email has been changed',
    html: `<h1>Email changed</h1><p>Your email was changed from ${oldEmail} to ${newEmail}.</p>`,
  });
}

function sendResetPassword(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  return send({
    email,
    subject: 'Reset your password',
    html: `<h1>Reset password</h1><a href="${href}">${href}</a>`,
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendConfirmEmail,
  sendEmailChanged,
  sendResetPassword,
};
