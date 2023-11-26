// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const URL = {
  LANDING_PAGE: 'https://www.narval.xyz',
  APPLICATION: 'https://app.narval.xyz',
  GITHUB: 'https://github.com/narval-xyz',
  TWITTER: 'https://twitter.com/Narvalgmi'
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Narval',
  tagline: 'Wallet Management for Organizations',
  url: URL.LANDING_PAGE,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'narval-xyz',
  projectName: 'Narval dev portal', 

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: URL.GITHUB,
        },
        blog: {
          showReadingTime: true,
          editUrl: URL.LANDING_PAGE,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Narval',
        logo: {
          alt: 'My Site Logo',
          src: 'img/narval-logo-circle.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: URL.GITHUB,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: URL.TWITTER,
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: URL.GITHUB,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Narval, Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
