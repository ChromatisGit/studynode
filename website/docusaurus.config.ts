import path from 'path';
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config, PluginConfig } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import COURSES_JSON from './.generated/configs/courses.config.json';
import { Course } from '../src/builder/transformer/courses';

const COURSES = COURSES_JSON as Course[];
const docsPlugins: PluginConfig[] = COURSES.map(c => (
  [
    '@docusaurus/plugin-content-docs',
    {
      id: `${c.group}-${c.slug}`,
      path: `./.generated/courses/${c.group}/${c.slug}`,
      routeBasePath: `${c.group}/${c.slug}`,
      sidebarPath: require.resolve(`./.generated/sidebars/${c.group}/${c.slug}.ts`),
      remarkPlugins: [require('remark-math')],
      rehypePlugins: [require('rehype-katex')],
    },
  ] satisfies PluginConfig
)
);

const config: Config = {
  title: 'StudyNode',
  tagline: 'Learning is great',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://herr-holst.de',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },

  presets: [
    ['classic', { docs: false, blog: false, theme: { customCss: './src/css/custom.css' } }],
  ],

  stylesheets: [
    { href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css', type: 'text/css' },
  ],

  plugins: [
    ...docsPlugins,
    [
      '@docusaurus/plugin-content-pages',
      {
        path: './.generated/courses/shared',
        routeBasePath: '/',
        id: 'generated-pages',
      },
    ],
    [require.resolve('@cmfcmf/docusaurus-search-local'), { language: ['de'] }],
    function aliasPlugin() {
      return {
        name: 'studynode-aliases',
        configureWebpack: () => ({
          resolve: {
            alias: {
              '@builder': path.resolve(__dirname, '../src/builder'),
              '@css': path.resolve(__dirname, 'src/css'),
              '@dev': path.resolve(__dirname, '../src/dev'),
              '@features': path.resolve(__dirname, 'src/features'),
              '@generated-configs': path.resolve(__dirname, '.generated/configs'),
              '@marp-styles': path.resolve(__dirname, '../src/marp-styles'),
              '@pages': path.resolve(__dirname, 'src/pages'),
              '@schema': path.resolve(__dirname, '../src/schema'),
              '@theme': path.resolve(__dirname, 'src/theme'),
              '@worksheet': path.resolve(__dirname, '../src/worksheet'),
            },
          },
        }),
      };
    },
  ],

  themeConfig: {
    tableOfContents: {
      // Workaround to disable tableOfContents
      minHeadingLevel: 6,
      maxHeadingLevel: 6
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    sidebar: {
      hideable: true,
    },
    navbar: {
      title: 'StudyNode',
      items: [{ type: 'custom-navbar', position: 'left' }],
      hideOnScroll: false
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'typescript', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
