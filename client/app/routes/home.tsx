import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function MultiplayerSetup() {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);

  const handlePlay = () => {
    // trigger fade animation before navigating
    setFadingOut(true);
    setTimeout(() => navigate("/menu"), 300);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-main-screen p-4 transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center pt-16 pb-12">
        <h1 className="text-8xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </div>
      <div className="bg-panel panel-card card-max flex flex-col mt-3">
        <div className="space-y-5">
          <button onClick={handlePlay} className="btn-menu btn-menu-primary">
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
