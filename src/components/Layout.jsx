import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen relative" style={{ background: 'var(--background)', color: 'var(--text)', overflow: 'hidden' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col items-center relative z-10" style={{ overflow: 'hidden' }}>
        <div className="w-full flex-1 custom-scrollbar" style={{ overflowY: 'auto', padding: '2rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl w-full"
            style={{ margin: '0 auto' }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          main { padding: 1rem; }
        }
      `}} />
    </div>
  );
};

export default Layout;
