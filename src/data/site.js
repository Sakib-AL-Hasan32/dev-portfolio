/**
 * Global site configuration.
 * Change your name, links and contact settings here — every page reads from this file.
 */
export const site = {
  name: 'Sakibul Hasan Sakib',
  shortName: 'Sakib',
  title: 'Java Backend Developer & AI Automation Engineer',
  roles: ['Java Backend Developer', 'Software Engineer', 'AI Automation Engineer'],
  location: 'Bangladesh',
  description:
    'Sakibul Hasan Sakib — Java Backend Developer and AI Automation Engineer from Bangladesh. Building scalable, secure backends with Java & Spring Boot, and AI-powered workflows.',

  // Absolute URL of the deployed site, used for canonical/OG tags and sitemap.xml.
  // e.g. 'https://sakib-al-hasan32.github.io' or 'https://sakib-al-hasan32.github.io/portfolio'
  // Leave empty to skip absolute URLs.
  url: '',

  // Put your photo at src/assets/images/profile.jpg (portrait, ~4:5 ratio works best).
  // If the file is missing, an initials placeholder is shown automatically.
  profileImage: 'assets/images/profile.jpg',

  email: 'shsakib32@gmail.com',
  socials: {
    github: { label: 'GitHub', url: 'https://github.com/Sakib-AL-Hasan32', handle: 'github.com/Sakib-AL-Hasan32' },
    linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/sakib-shs', handle: 'linkedin.com/in/sakib-shs' },
  },

  /**
   * Contact form delivery via Web3Forms (https://web3forms.com — free).
   * 1. Enter your email on web3forms.com to receive an access key.
   * 2. Paste it below. The key is designed to be public; it only allows sending to your inbox.
   * While empty, the form explains that it is not configured and offers a mailto link instead.
   */
  web3formsAccessKey: '',

  nav: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'contact', label: 'Contact' },
  ],
};
