module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('MAILHOG_HOST', 'mailhog'),
        port: env.int('MAILHOG_PORT', 1025),
        secure: false,
        auth: {
          user: env('MAILHOG_USER', 'mailhog'),
          pass: env('MAILHOG_PASS', 'mailhog'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      settings: {
        defaultFrom: 'no-reply@localhost',
        defaultReplyTo: 'no-reply@localhost',
      },
    },
  },
});
