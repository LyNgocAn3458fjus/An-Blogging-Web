import { AnimatePresence, motion } from "framer-motion";

const AnimationWrapper = ({
  children,
  KeyValue,
  className = "",
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={KeyValue}
        initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
