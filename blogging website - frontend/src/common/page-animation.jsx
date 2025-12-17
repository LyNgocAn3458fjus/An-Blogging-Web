import { AnimatePresence, motion } from "framer-motion";

/**
 * AnimationWrapper - reusable wrapper animation
 * Props:
 *  - KeyValue: key để AnimatePresence nhận diện
 *  - initial, animate, exit: trạng thái animation
 *  - transition: thời gian + easing
 *  - className: Tailwind class cho wrapper
 */
const AnimationWrapper = ({
  children,
  KeyValue,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  exit = { opacity: 0, y: 20 },
  transition = { duration: 0.8, ease: "easeInOut" },
  className = "",
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={KeyValue}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={className}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
