import { TextStyle } from 'react-native';

type TextVariant = Pick<
  TextStyle,
  'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing' | 'textTransform'
>;

export const typography = {
  display: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.9,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
  },
  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.9,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
} as const satisfies Record<string, TextVariant>;

export type TypographyScale = typeof typography;
