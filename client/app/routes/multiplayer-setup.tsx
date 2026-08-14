import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MultiplayerSetup() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="text-center pt-16 pb-15"
      >
        <h1 className="text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </motion.div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
        className="bg-panel panel-card card-max flex flex-col"
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Online Multiplayer</h2>
        <div className="space-y-5">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/host-game")} 
            className="btn-menu btn-menu-primary"
          >
            Host Game
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/join-game")} 
            className="btn-menu btn-menu-secondary"
          >
            Join Game
          </motion.button>
          <div className="pt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)} 
              className="btn-menu btn-menu-back"
            >
              Back
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

