import React from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center fixed inset-0 z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.1, 1],
          opacity: [0, 1, 1] 
        }}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut",
          times: [0, 0.6, 1],
          repeat: Infinity,
          repeatDelay: 0.5
        }}
        className="relative"
      >
        <img 
          src="/logo.png" 
          alt="Splintify Logo" 
          className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]"
        />
      </motion.div>
    </div>
  );
}
