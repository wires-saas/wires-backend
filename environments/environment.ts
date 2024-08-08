import { config as readEnvFile } from 'dotenv';

export default () => {
  readEnvFile();

  const appUrl = process.env.APP_URL;

  return {
    env: process.env.NODE_ENV,

    fallbackLanguage: process.env.FALLBACK_LANGUAGE,
    enableEmails: process.env.ENABLE_EMAILS === 'true',
    emailInterceptor: process.env.EMAIL_INTERCEPTOR,

    appName: process.env.APP_NAME,
    appUrl: process.env.APP_URL,

    theme: {
      primaryColor: '#6366f1',
      primaryLighterColor: '#c7d2fe',
      primaryDarkerColor: '#4f46e5',
      highlightBg: '#eef2ff',
    },

    urls: {
      acceptInviteURL: `${appUrl}/auth/accept-invite`,
      passwordResetURL: `${appUrl}/auth/reset-password`,
      helpURL: `${appUrl}/help`,
      tosURL: `${appUrl}/tos`,
      faqURL: `${appUrl}/faq`,
      privacyURL: `${appUrl}/privacy`,
      contactURL: `${appUrl}/contact`,
    },
  };
};
