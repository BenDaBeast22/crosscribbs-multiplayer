import { useEffect, useState } from "react";
import { socket } from "../../connections/socket";
import { playEmoteSound } from "~/utils/sounds";

type ActiveEmote = { id: string; emote: string; left: number };

let emoteCounter = 0;

export default function EmoteOverlay() {
  const [activeEmotes, setActiveEmotes] = useState<ActiveEmote[]>([]);

  useEffect(() => {
    const handleEmote = (data: { emote: string }) => {
      playEmoteSound(data.emote);
      const id = `emote-${Date.now()}-${emoteCounter++}`;
      const left = 20 + Math.random() * 60; // 20%–80% across the screen
      setActiveEmotes((prev) => [...prev, { id, emote: data.emote, left }]);
      setTimeout(() => {
        setActiveEmotes((prev) => prev.filter((e) => e.id !== id));
      }, 2200);
    };
    socket.on("emoteReceived", handleEmote);
    return () => {
      socket.off("emoteReceived", handleEmote);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <style>{`
        @keyframes emoteFloat {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          15% { transform: translateY(-10vh) scale(1.2); opacity: 1; }
          85% { transform: translateY(-70vh) scale(1); opacity: 1; }
          100% { transform: translateY(-85vh) scale(0.8); opacity: 0; }
        }
      `}</style>
      {activeEmotes.map((e) => (
        <div
          key={e.id}
          className="absolute bottom-10 text-5xl"
          style={{ left: `${e.left}%`, animation: "emoteFloat 2.2s ease-out forwards" }}
        >
          {e.emote}
        </div>
      ))}
    </div>
  );
}
