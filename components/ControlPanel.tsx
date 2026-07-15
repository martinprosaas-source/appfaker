import { ChangeEvent } from "react";
import { ChatMessage, Sender } from "@/lib/types";

interface ControlPanelProps {
  contactName: string;
  setContactName: (v: string) => void;
  avatarImage: string | null;
  setAvatarImage: (v: string | null) => void;
  avatarColor: string;
  setAvatarColor: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  battery: number;
  setBattery: (v: number) => void;
  activeSender: Sender;
  setActiveSender: (v: Sender) => void;
  messages: ChatMessage[];
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
}

const AVATAR_COLORS = ["#9A9A9E", "#FF3B30", "#FF9500", "#34C759", "#5AC8FA", "#AF52DE", "#FF2D55"];

export default function ControlPanel({
  contactName,
  setContactName,
  avatarImage,
  setAvatarImage,
  avatarColor,
  setAvatarColor,
  time,
  setTime,
  battery,
  setBattery,
  activeSender,
  setActiveSender,
  messages,
  onDeleteMessage,
  onClearAll,
}: ControlPanelProps) {
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-[340px] flex flex-col gap-6 text-[14px]">
      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-black/40">Contact</h2>
        <div>
          <label className="block text-black/60 mb-1">Nom</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Ex : Marie"
            className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#0B84FF]"
          />
        </div>

        <div>
          <label className="block text-black/60 mb-1">Photo de profil</label>
          <div className="flex items-center gap-3">
            {avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarImage} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: avatarColor }}
              />
            )}
            <label className="text-[#0B84FF] cursor-pointer">
              Importer une image
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            {avatarImage && (
              <button onClick={() => setAvatarImage(null)} className="text-black/40 hover:text-black/70">
                Retirer
              </button>
            )}
          </div>
          {!avatarImage && (
            <div className="flex gap-1.5 mt-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-5 h-5 rounded-full ${avatarColor === color ? "ring-2 ring-offset-1 ring-black/40" : ""}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-black/40">Barre de statut</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-black/60 mb-1">Heure</label>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="21:42"
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#0B84FF]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-black/60 mb-1">Batterie ({battery}%)</label>
            <input
              type="range"
              min={1}
              max={100}
              value={battery}
              onChange={(e) => setBattery(Number(e.target.value))}
              className="w-full mt-3"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-black/40">Envoyer en tant que</h2>
        <div className="flex rounded-lg border border-black/15 overflow-hidden">
          <button
            onClick={() => setActiveSender("me")}
            className={`flex-1 py-2 text-center transition-colors ${
              activeSender === "me" ? "bg-[#0B84FF] text-white" : "bg-white text-black/70"
            }`}
          >
            Moi
          </button>
          <button
            onClick={() => setActiveSender("them")}
            className={`flex-1 py-2 text-center transition-colors ${
              activeSender === "them" ? "bg-[#0B84FF] text-white" : "bg-white text-black/70"
            }`}
          >
            {contactName || "Contact"}
          </button>
        </div>
        <p className="text-black/40 text-[12px]">
          Tape et envoie directement depuis le clavier du téléphone à gauche — pratique pour ton screen record.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-black/40">Messages ({messages.length})</h2>
          {messages.length > 0 && (
            <button onClick={onClearAll} className="text-[12px] text-[#FF3B30] hover:underline">
              Tout effacer
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
          {messages.length === 0 && <p className="text-black/30 text-[13px]">Aucun message pour l&apos;instant.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-black/10 px-2.5 py-1.5"
            >
              <span
                className={`text-[10px] font-semibold uppercase shrink-0 ${
                  m.sender === "me" ? "text-[#0B84FF]" : "text-black/50"
                }`}
              >
                {m.sender === "me" ? "Moi" : "Eux"}
              </span>
              <span className="flex-1 truncate text-black/70">{m.text}</span>
              <button onClick={() => onDeleteMessage(m.id)} className="text-black/30 hover:text-[#FF3B30] shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
        <p className="text-black/40 text-[12px]">
          Double-clique un texte directement dans la bulle pour le modifier. Clique sur &laquo;&nbsp;Livré&nbsp;&raquo; sous ton dernier message pour basculer en &laquo;&nbsp;Lu&nbsp;&raquo;.
        </p>
      </section>
    </div>
  );
}
