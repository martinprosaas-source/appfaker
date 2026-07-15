import { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  showTail: boolean;
  showStatus: boolean;
  onTextChange?: (text: string) => void;
}

export default function MessageBubble({ message, showTail, showStatus, onTextChange }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      {message.image ? (
        <div className="imessage-bubble-in relative max-w-[75%] rounded-[18px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={message.image} alt="" className="block w-full h-auto max-h-[320px] object-cover" />
        </div>
      ) : (
        <div
          className={`imessage-bubble-in relative max-w-[75%] px-3.5 py-[7px] text-[15.5px] leading-[1.28] whitespace-pre-wrap break-words outline-none ${
            isMe
              ? `bg-[#0B84FF] text-white rounded-[18px] ${showTail ? "bubble-tail-sent" : ""}`
              : `bg-[#E9E9EB] text-black rounded-[18px] ${showTail ? "bubble-tail-received" : ""}`
          }`}
          contentEditable={Boolean(onTextChange)}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.(e.currentTarget.textContent ?? "")}
        >
          {message.text}
        </div>
      )}
      {showStatus && message.readAt && (
        <span className="mt-1 mr-1 text-[12px] text-[#8E8E93] select-none">Lu {message.readAt}</span>
      )}
    </div>
  );
}
