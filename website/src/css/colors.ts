export type ColorMode = 'light' | 'dark';
import { z } from 'zod';

export const accentColorSchema = z.enum(['purple', 'blue', 'green', 'orange', 'teal', 'red']);
export type AccentColor = z.infer<typeof accentColorSchema>;
//https://coolors.co/eb8023-af1b3f-2e8555-32989a-5784ec


export interface AccentTokens {
  accent: string;
  accentStrong: string;
  surface: string;
  border: string;
  mutedText: string;
}

type Palette = Record<AccentColor, Record<ColorMode, AccentTokens>>;

const palette: Palette = {
  purple: {
    light: {
      accent: 'var(--ifm-color-primary)',
      accentStrong: 'var(--ifm-color-primary-dark)',
      surface: 'color-mix(in srgb, var(--ifm-color-primary) 14%, #ffffff)',
      border: 'color-mix(in srgb, var(--ifm-color-primary) 38%, #dcd7ea)',
      mutedText: 'color-mix(in srgb, var(--ifm-color-primary) 78%, #2f2146)',
    },
    dark: {
      accent: 'var(--ifm-color-primary)',
      accentStrong: 'color-mix(in srgb, var(--ifm-color-primary) 88%, #d8c9ff)',
      surface: 'color-mix(in srgb, var(--ifm-color-primary) 18%, #0f1117)',
      border: 'color-mix(in srgb, var(--ifm-color-primary) 55%, #2b2f3c)',
      mutedText: 'color-mix(in srgb, var(--ifm-color-primary) 86%, #e6ddff)',
    },
  },
  blue: {
    light: {
      accent: '#1f6feb',
      accentStrong: '#0f4fa3',
      surface: '#e8f1ff',
      border: '#c7d9ff',
      mutedText: '#143b73',
    },
    dark: {
      accent: '#6ea8ff',
      accentStrong: '#9cc2ff',
      surface: '#12203a',
      border: '#2e4670',
      mutedText: '#d7e6ff',
    },
  },
  orange: {
    light: {
      accent: '#e36209',
      accentStrong: '#c85007',
      surface: '#fff1e2',
      border: '#f6c7a4',
      mutedText: '#9f3e04',
    },
    dark: {
      accent: '#ffb167',
      accentStrong: '#ffc894',
      surface: '#27160b',
      border: '#4d2c14',
      mutedText: '#ffe3c7',
    },
  },
  teal: {
    light: {
      accent: '#1da1a5',
      accentStrong: '#148488',
      surface: '#e6f7f8',
      border: '#bde8ea',
      mutedText: '#0d6063',
    },
    dark: {
      accent: '#66d2d5',
      accentStrong: '#8de3e5',
      surface: '#0d1f20',
      border: '#1f4c4f',
      mutedText: '#d4f4f5',
    },
  },
  green: {
    light: {
      accent: '#2e8555',
      accentStrong: '#276c46',
      surface: '#e7f4ec',
      border: '#cce7d8',
      mutedText: '#1f5133',
    },
    dark: {
      accent: '#63c58a',
      accentStrong: '#88d7a5',
      surface: '#0f1a14',
      border: '#234233',
      mutedText: '#d3f1de',
    },
  },
  red: {
    light: {
      accent: '#AF1B3F',
      accentStrong: '#8c1533',
      surface: '#f9e8ed',
      border: '#e9c7d1',
      mutedText: '#5a0f24',
    },
    dark: {
      accent: '#e06583',
      accentStrong: '#ff8fa8',
      surface: '#2c101a',
      border: '#552534',
      mutedText: '#f6d6de',
    },
  },
};

export function getAccentTokens(accent: AccentColor, mode: ColorMode): AccentTokens {
  return palette[accent][mode];
}
