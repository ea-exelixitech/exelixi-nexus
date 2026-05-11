/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Exélixi (Manual Corporativo)
        oxford:   { DEFAULT: '#0C133A', light: '#1a2255', dark: '#07092a' },
        pumpkin:  { DEFAULT: '#ED7423', light: '#F69558', dark: '#C75D14' },
        skyx:     { DEFAULT: '#05C6DF', light: '#4FDBED', dark: '#04A8BD' },
        platinum: { DEFAULT: '#E5E5E5', dark: '#cfd2d8' },
      },
      fontFamily: {
        display: ['Manrope', 'Apfel Grotezk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'pumpkin':  '0 6px 16px -4px rgba(237,116,35,0.35)',
        'oxford':   '0 6px 16px -4px rgba(12,19,58,0.35)',
        'card':     '0 1px 2px rgba(12,19,58,0.04), 0 4px 12px rgba(12,19,58,0.04)',
        'elev':     '0 4px 24px rgba(12,19,58,0.08)',
      },
      keyframes: {
        'pulse-pumpkin': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(237,116,35,0.45)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(237,116,35,0)' },
        },
      },
      animation: {
        'pulse-pumpkin': 'pulse-pumpkin 2s infinite',
      },
    },
  },
  plugins: [],
};
