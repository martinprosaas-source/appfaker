import { ChangeEvent, useState } from "react";
import { ChatMessage } from "@/lib/types";

interface MobilePrepProps {
  contactName: string;
  setContactName: (v: string) => void;
  avatarImage: string | null;
  setAvatarImage: (v: string | null) => void;
  avatarColor: string;
  setAvatarColor: (v: string) => void;
  script: ChatMessage[];
  revealedCount: number;
  onAddToScript: (text: string) => void;
  onDeleteMessage: (id: string) => void;
  onMoveMessage: (index: number, direction: -1 | 1) => void;
  onResetPlayback: () => void;
  onClearAll: () => void;
  onStartRecording: () => void;
}

const AVATAR_COLORS = ["#9A9A9E", "#FF3B30", "#FF9500", "#34C759", "#5AC8FA", "#AF52DE", "#FF2D55"];

export default function MobilePrep({
  contactName,
  setContactName,
  avatarImage,
  setAvatarImage,
  avatarColor,
  setAvatarColor,
  script,
  revealedCount,
  onAddToScript,
  onDeleteMessage,
  onMoveMessage,
  onResetPlayback,
  onClearAll,
  onStartRecording,
}: MobilePrepProps) {
  const [draftText, setDraftText] = useState("");

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitDraft = () => {
    const trimmed = draftText.trim();
    if (!trimmed) return;
    onAddToScript(trimmed);
    setDraftText("");
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#f2f2f5] text-[15px]">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-3 bg-white border-b border-black/10">
        <h1 className="text-[18px] font-semibold">Préparer la conversation</h1>
        <p className="text-black/50 text-[13px] mt-0.5">
          Écris ici les messages de {contactName || "ton contact"}, dans l&apos;ordre. Pendant l&apos;enregistrement, tu
          tapes et envoies tes propres messages normalement — {contactName || "il/elle"} répond automatiquement avec
          le message suivant à chaque fois que tu envoies.
        </p>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <section className="bg-white rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-black/40">Contact</h2>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nom du contact"
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 outline-none focus:border-[#0B84FF]"
          />
          <div className="flex items-center gap-3">
            {avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarImage} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full" style={{ backgroundColor: avatarColor }} />
            )}
            <label className="text-[#0B84FF]">
              Importer une photo
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            {avatarImage && (
              <button onClick={() => setAvatarImage(null)} className="text-black/40">
                Retirer
              </button>
            )}
          </div>
          {!avatarImage && (
            <div className="flex gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-full ${avatarColor === color ? "ring-2 ring-offset-2 ring-black/40" : ""}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-black/40">
            Messages de {contactName || "ton contact"} ({script.length})
          </h2>

          <div className="flex items-center gap-2">
            <input
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitDraft();
                }
              }}
              placeholder={`Écrire un message de ${contactName || "ton contact"}...`}
              className="flex-1 rounded-lg border border-black/15 px-3 py-2.5 outline-none focus:border-[#0B84FF]"
            />
            <button
              onClick={submitDraft}
              disabled={!draftText.trim()}
              className={`px-4 py-2.5 rounded-lg font-medium shrink-0 ${
                draftText.trim() ? "bg-[#0B84FF] text-white" : "bg-black/10 text-black/40"
              }`}
            >
              Ajouter
            </button>
          </div>

          {script.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {script.map((m, index) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                    index < revealedCount ? "border-[#0B84FF]/30 bg-[#0B84FF]/5" : "border-black/10"
                  }`}
                >
                  <span className="flex-1 truncate">{m.image ? "📷 Photo" : m.text}</span>
                  <div className="flex items-center shrink-0">
                    <button
                      onClick={() => onMoveMessage(index, -1)}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center text-black/40 disabled:opacity-20"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMoveMessage(index, 1)}
                      disabled={index === script.length - 1}
                      className="w-7 h-7 flex items-center justify-center text-black/40 disabled:opacity-20"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => onDeleteMessage(m.id)}
                      className="w-7 h-7 flex items-center justify-center text-black/30"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[13px] text-black/50 mt-1">
            <span>
              {revealedCount}/{script.length} déjà utilisés
            </span>
            <div className="flex gap-3">
              {revealedCount > 0 && (
                <button onClick={onResetPlayback} className="text-[#0B84FF]">
                  Réinitialiser la lecture
                </button>
              )}
              {script.length > 0 && (
                <button onClick={onClearAll} className="text-[#FF3B30]">
                  Tout effacer
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-auto sticky bottom-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 bg-gradient-to-t from-[#f2f2f5] via-[#f2f2f5]">
        <button
          onClick={onStartRecording}
          disabled={script.length === 0}
          className={`w-full rounded-full py-3.5 font-semibold text-center ${
            script.length > 0 ? "bg-[#0B84FF] text-white" : "bg-black/10 text-black/40"
          }`}
        >
          Lancer l&apos;enregistrement
        </button>
      </div>
    </div>
  );
}
