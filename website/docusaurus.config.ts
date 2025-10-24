import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Math + Mermaid + lokale Suche
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {

  title: 'Learnpage',
  tagline: 'Mathematik & Informatik',
  favicon: 'img/favicon.ico',

  future: { v4: true },

  // --- Deployment (GitHub Pages) ---
  url: 'https://chromatis.github.io',
  baseUrl: '/studyspace/',             // z.B. '/website/'
  organizationName: 'chromatis',
  projectName: 'studyspace',           // z.B. 'website'
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: { defaultLocale: 'de', locales: ['de'] },

  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateTime: true,
        },
        blog: false,
        theme: { customCss: require.resolve('./src/css/custom.css') },
      } satisfies Preset.Options,
    ],
  ],

  // --- Plugins ---
  plugins: [
    [
      require.resolve('@cmfcmf/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        language: ['de'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  // --- Markdown ---
  markdown: { mermaid: true },

  // --- KaTeX CSS (CDN) ---
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-mll67QQb0Y3jK8w2p6kO9yW0r1rWm5j0rVQbI7kJt8O2f0+X8NcXwq3qYyYb8F0o',
      crossOrigin: 'anonymous',
    },
  ],


  themeConfig: {
    image: 'img/social-card.png',
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'TG Lernplattform',
      logo: { alt: 'Logo', src: 'img/logo.svg' },
      items: [
        {type: 'docSidebar', sidebarId: 'matheSidebar', position: 'left', label: 'Mathe'},
        {type: 'docSidebar', sidebarId: 'infoSidebar', position: 'left', label: 'Informatik'},
        {type: 'docSidebar', sidebarId: 'uebungenSidebar', position: 'left', label: 'Übungen'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Rechtliches', items: [{ label: 'Impressum', to: '/docs/impressum' }] },
      ],
      copyright: `© ${new Date().getFullYear()} Christian Holst`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'java', 'sql', 'bash', 'powershell', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;