import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'Armory - Documentation',
  tagline: 'Unicorn whales are cool',
  favicon: 'img/favicon.ico',

  url: 'https://docs.narval.xyz',
  baseUrl: '/',

  organizationName: 'narval-xyz',
  projectName: 'armory',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts'
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'for Developers',
      logo: {
        alt: 'Narval logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-white.svg'
      },
      items: [
        {
          href: 'https://github.com/narval-xyz',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula
    }
  } satisfies Preset.ThemeConfig
}

export default config
