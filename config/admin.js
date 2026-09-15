module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  forgotPassword: {
    from: env('SMTP_FROM', 'no-reply@localhost'),
    replyTo: env('SMTP_FROM', 'no-reply@localhost'),
    emailTemplate: {
      subject: 'Reset password - 69 Cybersec',
      text: `You are receiving this email because we received a password reset request for your admin account.
Reset password link: <%= url %>

This link will expire in 1 hour.

If you did not request a password reset, no further action is required.`,
      html: `<p>You are receiving this email because we received a password reset request for your admin account.</p>
<p>Reset password link: <a href="<%= url %>"><%= url %></a></p>
<p>This link will expire in 1 hour.</p>
<p>If you did not request a password reset, no further action is required.</p>`,
    },
  },
});