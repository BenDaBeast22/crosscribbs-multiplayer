import { useNavigate } from "react-router";

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
    <button
      onClick={handleClick}
      className="btn-menu btn-menu-back"
    >
      Back
    </button>
  );
}
