export default () => {
  const appUrl = 'http://localhost:4200';

  return {
    fallbackLanguage: 'fr',

    appName: 'Wires',
    appUrl: appUrl,

    theme: {
      primaryColor: '#6366f1',
      primaryLighterColor: '#c7d2fe',
      primaryDarkerColor: '#4f46e5',
      highlightBg: '#eef2ff',
    },

    urls: {
      acceptInviteURL: `${appUrl}/auth/accept-invite`,
      helpURL: `${appUrl}/help`,
      tosURL: `${appUrl}/tos`,
      faqURL: `${appUrl}/faq`,
      privacyURL: `${appUrl}/privacy`,
      contactURL: `${appUrl}/contact`,
    },
  };
};
