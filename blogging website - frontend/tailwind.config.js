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
      colors: {
        white: '#FFFFFF',
        black: '#242424',
        grey: '#F3F3F3',
        'dark-grey': '#6B6B6B',
        red: '#FF4E4E',
        twitter: '#1DA1F2',
        purple: '#8B46FF',
        transparent: 'transparent',

        // Màu bổ sung cho nav, form, button
        navy: '#327BA8',        // màu xanh đậm
        steel: '#4A6073',       // xám xanh nhẹ
        skyBlue: '#5DADE2',     // lấy từ gradient
        slate: '#778899',       // lấy từ gradient
        cyanDark: '#1ABC9C',    // màu xanh cyan nổi bật
      },
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
      },
      backgroundBlendMode: {
        multiply: 'multiply',
      },
      backgroundImage: {
        // Định nghĩa gradient tùy chỉnh
        'gradient-cyan-red': 'linear-gradient(93deg,rgba(87, 87, 158, 1) 0%, rgba(189, 51, 51, 1) 100%, rgba(222, 11, 11, 1) 55%)',
        'gradient-blue-grey': 'radial-gradient( circle farthest-corner at 50% 52.5%,  rgba(14,53,92,1) 0%, rgba(16,14,72,1) 90% )',
        'gradient-blue-dark': 'linear-gradient(90deg,rgba(70, 70, 156, 1) 7%, rgba(37, 37, 83, 1) 45%, rgba(0, 0, 0, 1) 96%)',
        'grad-dark-slate': 'linear-gradient(60deg, #29323c 0%, #485563 100%)',
        'dark-multiply': `
          linear-gradient(to bottom, #323232 0%, #3F3F3F 40%, #1C1C1C 150%),
          linear-gradient(to top, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.25) 200%)
        `,
        // màu bg chính
        'soft-lavender': 'linear-gradient(to top, #bdc2e8 0%, #bdc2e8 1%, #e6dee9 100%)',
        // xanh trắng
        'sky-lavender': 'linear-gradient(-225deg, #7DE2FC 0%, #B9B6E5 100%)',
        //trắng mềm 
        'soft-white': 'linear-gradient(to top, #dfe9f3 0%, white 100%)',
        'ocean-twilight':'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
      },
    },
  },
  plugins: [],
};
