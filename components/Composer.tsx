import { ChangeEvent, useRef, useState } from "react";

interface ComposerProps {
  onSend: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  autotypeText?: string | null;
}

export default function Composer({ onSend, onSendImage, autotypeText = null }: ComposerProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAutotyping = autotypeText !== null;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSendImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const displayedValue = isAutotyping ? autotypeText : text;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 px-2.5 py-2 border-t border-black/10 bg-white"
    >
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isAutotyping}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-black/15 text-black/50 shrink-0 disabled:opacity-40"
      >
        <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1.5V13.5M1.5 7.5H13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />

      <div className="flex-1 flex items-center rounded-full border border-black/15 px-4 py-2">
        <input
          value={displayedValue}
          readOnly={isAutotyping}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Envoyer depuis iMessage"
          className="w-full text-[17px] outline-none placeholder:text-black/35"
        />
      </div>
      <button
        onClick={submit}
        disabled={!text.trim() || isAutotyping}
        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${
          text.trim() && !isAutotyping ? "bg-[#0B84FF]" : "bg-black/10"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
          <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
