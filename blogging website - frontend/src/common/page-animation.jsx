import { AnimatePresence, motion } from "framer-motion";//thư viện animation mạnh mẽ
// trạng thái ban đầu là mờ 0, sau đó là độ mờ là 1 và được thực hiện trong 1s
const AnimationWrapper = ({ children, KeyValue, initial = { opacity: 0 }, animate = { opacity: 1 }, transition = { duration: 1 }, className }) => {
    return (
        <AnimatePresence>
            <motion.div
                key={KeyValue}
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>

    )
}
export default AnimationWrapper;