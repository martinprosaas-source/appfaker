interface ChatHeaderProps {
  contactName: string;
  avatarImage: string | null;
  avatarColor: string;
  onBack?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ChatHeader({ contactName, avatarImage, avatarColor, onBack }: ChatHeaderProps) {
  return (
    <div className="relative flex flex-col items-center pt-1 pb-2 border-b border-black/10 bg-white/95">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBack?.();
        }}
        className="absolute left-2 top-1 flex items-center text-[#007AFF] text-[17px] select-none z-30"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="mr-0.5">
          <path d="M10 2L2 10L10 18" stroke="#007AFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {avatarImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarImage}
          alt=""
          className="w-[52px] h-[52px] rounded-full object-cover"
        />
      ) : (
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-[19px] font-medium select-none"
          style={{ backgroundColor: avatarColor }}
        >
          {getInitials(contactName)}
        </div>
      )}

      <div className="mt-1 flex items-center gap-0.5 text-[12px] font-semibold text-black select-none">
        {contactName || "Nom du contact"}
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <path d="M1.5 1.5L6.5 7L1.5 12.5" stroke="#9A9A9E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
