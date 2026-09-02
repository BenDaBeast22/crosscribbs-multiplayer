import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

export default function MultiplayerSetup() {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);

  const handlePlay = () => {
    // trigger fade animation before navigating
    setFadingOut(true);
    setTimeout(() => navigate("/menu"), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="text-center pt-16 pb-12"
      >
        <h1 className="text-8xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.15 }}
        className="bg-panel panel-card card-max flex flex-col mt-3"
      >
        <div className="space-y-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlay}
            className="btn-menu btn-menu-primary"
          >
            Play
          </motion.button>
        </div>
      </motion.div>
      <p className="fixed bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-[11px] md:text-xs pointer-events-none">
        Made by Jefaw and BenDaBeast22
      </p>
    </motion.div>
  );
}
