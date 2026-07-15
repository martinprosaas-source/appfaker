import { useState } from "react";
import { Sender } from "@/lib/types";

interface ComposerProps {
  activeSender: Sender;
  contactName: string;
  onSend: (text: string) => void;
}

export default function Composer({ activeSender, contactName, onSend }: ComposerProps) {
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 px-2.5 py-2 border-t border-black/10 bg-white"
    >
      <div className="flex-1 flex items-center rounded-full border border-black/15 px-3.5 py-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`Envoyer en tant que ${activeSender === "me" ? "Moi" : contactName || "contact"}`}
          className="w-full text-[15px] outline-none placeholder:text-black/35"
        />
      </div>
      <button
        onClick={submit}
        disabled={!text.trim()}
        className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${
          text.trim() ? "bg-[#0B84FF]" : "bg-black/10"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
