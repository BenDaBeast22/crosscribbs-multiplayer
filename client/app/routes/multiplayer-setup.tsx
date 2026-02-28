import { useNavigate } from "react-router-dom";

export default function MultiplayerSetup() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-main-screen p-4">
      <div className="text-center pt-16 pb-15">
        <h1 className="text-6xl font-bold title-gradient drop-shadow-lg">Cross Cribbs</h1>
      </div>
      <div className="bg-panel panel-card card-max flex flex-col">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Online Multiplayer</h2>
        <div className="space-y-5">
          <button onClick={() => navigate("/host-game")} className="btn-menu btn-menu-primary">
            Host Game
          </button>
          <button onClick={() => navigate("/join-game")} className="btn-menu btn-menu-secondary">
            Join Game
          </button>
          <div className="pt-2">
            <button
              onClick={() => navigate(-1)}
              className="btn-menu btn-menu-back"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
