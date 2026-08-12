/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'audiowide': ['Audiowide', 'cursive'],
        'lora': ['Lora', 'serif'],
        'arizona-flare': ['Arizona Flare', 'serif'],
      },
      colors: {
        'mall-primary': '#2e3094',
        'mall-secondary': '#801424',
        'mall-blue': '#2e3094',
        'mall-red': '#801424',
        'mall-background': '#F8FAFC',
        'mall-accent': '#F1F4F9',
        'mall-accent-dark': '#16194A',
        'mall-cream': '#FAFAFD',
        'mall-brown': '#181A40',
        'mall-reseda-green': '#2e3094',
        'mall-sage': '#64748B',
        'mall-dark-sage': '#334155',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 