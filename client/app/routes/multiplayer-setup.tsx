import { useNavigate } from "react-router-dom";

export default function MultiplayerSetup() {
  const navigate = useNavigate();

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-main-screen p-4">
      <div className="text-center mb-12">
  <h1 className="text-6xl font-bold mb-2 title-gradient">Cross Cribbs</h1>
      </div>
  <div className="bg-panel panel-card card-max">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Multiplayer</h2>
        <div className="space-y-4">
          <button onClick={() => navigate("/host-game")} className="w-full btn-primary shadow font-bold text-lg transition-colors duration-200">
            Host Game
          </button>
          <button onClick={() => navigate("/join-game")} className="w-full btn-primary shadow font-bold text-lg transition-colors duration-200">
            Join Game
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-base transition-colors duration-200"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
