// styles/theme.ts
import { COLORS } from '../constants/colors';

export const theme = {
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    error: COLORS.error,
    background: COLORS.white,
    text: COLORS.text,
  },
  fontFamily: {
    regular: 'Jost',
    medium: 'Jost-Medium',
    bold: 'Jost-Bold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 20,
  },
};
