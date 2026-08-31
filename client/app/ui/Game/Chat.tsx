import { useEffect, useRef, useState } from "react";
import { socket } from "../../connections/socket";
import { playEmoteSound, playMessageNotificationSound, playMessageSentSound } from "~/utils/sounds";

type ChatMessageType = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
};

type ChatProps = {
  lobbyId?: string;
  playerId: string;
  playerName: string;
  isMultiplayer: boolean;
};

const EMOTES = ["👍", "😂", "😮", "😡", "🤔", "🙄", "🤫", "🎉"];

export default function Chat({ lobbyId, playerId, playerName, isMultiplayer }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleIncoming = (msg: ChatMessageType) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.playerId !== playerId) {
        playMessageNotificationSound();
        if (!isOpen) setUnread((u) => u + 1);
      }
    };
    socket.on("chatMessage", handleIncoming);
    return () => {
      socket.off("chatMessage", handleIncoming);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    socket.emit("sendChatMessage", {
      lobbyId: isMultiplayer ? lobbyId : undefined,
      playerId,
      playerName,
      text,
    });
    playMessageSentSound();
    setDraft("");
  };

  const sendEmote = (emote: string) => {
    socket.emit("sendEmote", {
      lobbyId: isMultiplayer ? lobbyId : undefined,
      playerId,
      playerName,
      emote,
    });
    setShowEmotes(false);
    playEmoteSound(emote);
  };

  return (
    <>
      {/* Toggle button — sits above the History FAB on mobile so they don't overlap */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-3 left-3 z-40 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-4 rounded-full shadow-lg border border-slate-600 flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        <span>💬</span>
        <span className="hidden sm:inline">Chat</span>
        {unread > 0 && (
          <span className="ml-0.5 bg-red-500 text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px]">
            {unread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop on mobile only, so tapping outside closes it like the History modal */}
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />

          <div
            className="
              fixed z-50 border border-slate-700 shadow-2xl flex flex-col
              inset-x-0 bottom-0 rounded-t-2xl max-h-[70vh]
              md:inset-x-auto md:bottom-16 md:left-3 md:w-80 md:rounded-2xl md:max-h-[60vh]
              bg-slate-900 md:backdrop-blur-none
            "
          >
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <span>💬</span> Chat
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-[120px]">
              {messages.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4">No messages yet — say hi!</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={m.playerId === playerId ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block rounded-xl px-3 py-1.5 text-xs max-w-[85%] break-words ${
                      m.playerId === playerId ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                    }`}
                  >
                    {m.playerId !== playerId && (
                      <div className="text-[10px] text-slate-300 font-semibold mb-0.5">{m.playerName}</div>
                    )}
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {showEmotes && (
              <div className="grid grid-cols-8 md:grid-cols-4 gap-1 px-3 pb-2">
                {EMOTES.map((e) => (
                  <button
                    key={e}
                    onClick={() => sendEmote(e)}
                    className="text-xl hover:scale-125 transition-transform bg-slate-800 hover:bg-slate-700 rounded-lg py-1"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-slate-700 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:pb-2">
              <button
                onClick={() => setShowEmotes((s) => !s)}
                className="text-lg hover:scale-110 transition-transform shrink-0"
                title="Emotes"
              >
                😊
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 text-white text-xs rounded-full px-3 py-2 outline-none border border-slate-600 focus:border-slate-400"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full px-3 py-2 shrink-0"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
