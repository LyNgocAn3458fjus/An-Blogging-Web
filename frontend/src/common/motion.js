// animations.js
// Các class Tailwind reusable cho card, banner, tags, title, like
//tạo chuyển động cho các đối tượng 

export const cardHover = `
  transition-all duration-400
  hover:-translate-y-1
  hover:shadow-[0_30px_60px_-20px_rgba(99,102,241,0.35)]
`;

export const bannerHover = `
  transition-all duration-300
  group-hover:scale-110
  group-hover:brightness-90
`;

export const overlayHover = `
  absolute inset-0
  bg-gradient-to-tr from-purple/30 via-transparent to-black/30
  opacity-0 group-hover:opacity-100
  transition-opacity duration-400
`;

export const titleHover = `
  transition-all duration-200
  group-hover:text-purple
  group-hover:translate-x-1
`;

export const tagHover = `
  transition-colors duration-200
  hover:bg-purple/10 hover:text-purple
  cursor-pointer
`;

export const likeHover = `
  transition-all duration-200
  group-hover:text-red
  group-hover:scale-110
  transition-transform
`;
export const authorImageHover = `
  transition-transform duration-300
  group-hover:scale-110
  rounded-full
  cursor-pointer
`;
export const indexHover = `
  text-dark-grey
  transition-colors duration-300
  group-hover:text-purple
`;
// motion.js
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const bannerMotion = {
  initial: { scale: 1, filter: "brightness(1)" },
  whileHover: {
    scale: 1.05,
    filter: "brightness(0.85)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const titleMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  whileHover: { scale: 1.02, color: "#7c3aed" }, // Tailwind purple
  transition: { duration: 0.5, ease: "easeOut" },
};
