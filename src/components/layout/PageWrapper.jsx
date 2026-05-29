// src/components/layout/PageWrapper.jsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition = {
  duration: 0.24,
  ease: 'easeOut',
};

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={['pt-14 min-h-screen pb-20 md:pb-0', className].join(' ')}
    >
      {children}
    </motion.div>
  );
}
