import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    fontSize: {
      sm: '12px',
      base: '14px',
      xl: '16px',
      '2xl': '20px',
      '3xl': '28px',
      '4xl': '38px',
      '5xl': '50px',
    },

    extend: {
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
      },
      backgroundBlendMode: {
        multiply: 'multiply',
      },
    },
  },

  plugins: [
    createThemes({

      /* ================= LIGHT ================= */

      light: {

        /* ===== Background ===== */
        'bg-main': '#F8FAFC',   // rất sáng, clean (slate-50 vibe)
        'bg-soft': '#EEF2F7',   // background phụ
        'bg-nav': '#F1F3F5',    // navbar trắng hiện đại
  
        'bg-list': '#F1F5F9',   // card nhẹ

        /* ===== Text ===== */
        'white': '#FFFFFF',
        'black': '#0F172A',     // gần slate-900
        'grey': '#475569',      // slate-600
        'dark-grey': '#1E293B', // slate-800
        'dark':'#000000',
        'light':'#FFFFFF',
        /* ===== Accent ===== */
        'red': '#FF4E4E',       // giữ đỏ brand của bạn
        twitter: '#1DA1F2',
        purple: '#7C3AED',      // tím tech (violet-600)
        navy: '#2563EB',        // blue-600 hiện đại
        steel: '#334155',       // slate-700
        skyBlue: '#38BDF8',     // sky-400
        slate: '#64748B',       // slate-500
        cyanDark: '#06B6D4',    // cyan-500

        transparent: 'transparent',
      },


      /* ================= DARK ================= */

      dark: {

        /* ===== Background ===== */
        'bg-main': '#0F172A',   // slate-900 chuẩn dark mode tech
        // 'bg-soft': '#1E293B',   // slate-
        'bg-soft': '#393E46', // xám đậm hơi xanh (giống bg-main)
        'bg-nav': '#111827',    // gần gray-900
        'bg-list': '#1F2937',   // card dark

        /* ===== Text ===== */
        'white': '#F8FAFC',     // text chính
        'black': '#F8FAFC',
        'grey': '#94A3B8',      // slate-400
        'dark-grey': '#CBD5E1', // slate-300
        'dark':'#000000',
        'light':'#FFFFFF',

        /* ===== Accent ===== */
        'red': '#FF6B6B',       // đỏ sáng hơn để nổi trên nền tối
        twitter: '#1DA1F2',
        purple: '#A78BFA',      // violet-400
        navy: '#3B82F6',        // blue-500
        steel: '#475569',
        skyBlue: '#7DD3FC',
        slate: '#94A3B8',
        cyanDark: '#2DD4BF',



        transparent: 'transparent',
      }

    })
  ]
};
