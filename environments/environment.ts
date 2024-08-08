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

    theme: {
      primaryColor: '#6366f1',
      primaryLighterColor: '#c7d2fe',
      primaryDarkerColor: '#4f46e5',
      highlightBg: '#eef2ff',
    },

    urls: {
      acceptInviteURL: `${appUrl}/${fallbackLanguage}/auth/accept-invite`,
      passwordResetURL: `${appUrl}/${fallbackLanguage}/auth/reset-password`,
      helpURL: `${appUrl}/${fallbackLanguage}/help`,
      tosURL: `${appUrl}/${fallbackLanguage}/tos`,
      faqURL: `${appUrl}/${fallbackLanguage}/faq`,
      privacyURL: `${appUrl}/${fallbackLanguage}/privacy`,
      contactURL: `${appUrl}/${fallbackLanguage}/contact`,
    },
  };
};
