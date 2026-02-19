import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-screen-bg" />
      <div className="loading-screen-noise" />
      <div className="loading-screen-vignette" />
      
      <motion.div 
        className="loading-screen-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div 
          className="loading-screen-logo"
          animate={{ 
            filter: ['drop-shadow(0 0 20px rgba(230, 126, 34, 0.35))', 'drop-shadow(0 0 40px rgba(230, 126, 34, 0.5))', 'drop-shadow(0 0 20px rgba(230, 126, 34, 0.35))']
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={72} color="var(--primary)" strokeWidth={2} />
        </motion.div>
        
        <h1 className="loading-screen-title">
          <span className="loading-screen-title-line">RUST</span>
          <span className="loading-screen-title-line">LEGACY</span>
        </h1>
        
        <p className="loading-screen-subtitle">{message}</p>
        
        <div className="loading-screen-bar">
          <motion.div 
            className="loading-screen-bar-fill"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '70%', '90%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
