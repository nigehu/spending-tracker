import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontSize: {
        '2xs': '0.5rem', // 8px
      },
      height: {
        'screen-minus-p1': 'calc(100vh - 0.25rem)',
      },
    },
  },
  plugins: [],
} satisfies Config;
