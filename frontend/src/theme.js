// src/theme.js
import { createTheme } from '@mui/material/styles';

export const makeAppTheme = (mode = 'light', direction = 'rtl') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#000000',      // الأسود كلون أساسي
        contrastText: '#fff', // النص الأبيض فوق الأزرار السوداء
      },
      secondary: {
        main: '#ffffffff',      // مثال: أحمر، يمكنك تغييره حسب الحاجة
      },
    },
    direction,
    typography: {
      fontFamily: 'var(--font-base)',
      h1: { fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.25 },
      h3: { fontFamily: 'var(--font-heading)', fontWeight: 700 },
      h4: { fontFamily: 'var(--font-heading)', fontWeight: 800 },
      button: { textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          html, body, #root { height: 100%; }
          * { font-feature-settings: "kern"; }
        `,
      },
    },
  });
