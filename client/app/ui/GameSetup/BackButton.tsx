import { useNavigate } from "react-router";
import { motion } from "framer-motion";

type ChildProps = {
  handler?: any;
};
export default function BackButton({ handler }: ChildProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (handler) {
      handler();
    } else {
      navigate(-1);
    }
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="btn-menu btn-menu-back"
    >
      Back
    </motion.button>
  );
}
