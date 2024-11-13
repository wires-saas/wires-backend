import { config as readEnvFile } from 'dotenv';

export default () => {
  readEnvFile();

  const appUrl = process.env.APP_URL;
  const fallbackLanguage = process.env.FALLBACK_LANGUAGE;

  return {
    env: process.env.NODE_ENV,

    fallbackLanguage: process.env.FALLBACK_LANGUAGE,
    enableEmails: process.env.ENABLE_EMAILS === 'true',
    emailInterceptor: process.env.EMAIL_INTERCEPTOR,

    appName: process.env.APP_NAME,
    appUrl: process.env.APP_URL,

    S3_url: process.env.S3_URL,
    S3_port: process.env.S3_PORT,
    S3_protocol: process.env.S3_PROTOCOL,
    S3_accessKey: process.env.S3_USER,
    S3_secretKey: process.env.S3_PASSWORD,
    S3_publicBucket: process.env.S3_PUBLIC_BUCKET,

    theme: {
      primaryColor: '#6366f1',
      primaryLighterColor: '#c7d2fe',
      primaryDarkerColor: '#4f46e5',
      highlightBg: '#eef2ff',
    },

    urls: {
      acceptInviteURL: `${appUrl}/${fallbackLanguage}/auth/accept-invite`,
      passwordResetURL: `${appUrl}/${fallbackLanguage}/auth/reset-password`,
      createOrganizationInviteURL: `${appUrl}/${fallbackLanguage}/auth/create-organization`,
      helpURL: `${appUrl}/${fallbackLanguage}/help`,
      tosURL: `${appUrl}/${fallbackLanguage}/tos`,
      faqURL: `${appUrl}/${fallbackLanguage}/faq`,
      privacyURL: `${appUrl}/${fallbackLanguage}/privacy`,
      contactURL: `${appUrl}/${fallbackLanguage}/contact`,
    },
  };
};
