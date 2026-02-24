import { useNavigate } from "react-router-dom";

export default function MultiplayerSetup() {
  const navigate = useNavigate();

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4">
      <div className="text-center mb-12">
  <h1 className="text-6xl font-bold mb-2 title-gradient">
          Cross Cribbs
        </h1>
      </div>
  <div className="bg-panel panel-card card-max">
        {/* <h2 className="text-2xl font-bold text-white mb-6 ">Home</h2> */}
        <div className="space-y-4">
          <button onClick={() => navigate("/menu")} className="w-full btn-primary shadow font-bold text-lg transition-colors duration-200">
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
