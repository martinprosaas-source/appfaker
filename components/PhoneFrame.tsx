import { useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/types";
import StatusBar from "./StatusBar";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";

interface PhoneFrameProps {
  contactName: string;
  avatarImage: string | null;
  avatarColor: string;
  time?: string;
  battery?: number;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  onTextChange?: (id: string, text: string) => void;
  fullscreen?: boolean;
  onBackgroundTap?: () => void;
  onBack?: () => void;
}

function MessageList({
  messages,
  onTextChange,
}: {
  messages: ChatMessage[];
  onTextChange?: (id: string, text: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-black/30 text-sm text-center px-8">
        Tape un message en bas pour démarrer la conversation
      </div>
    );
  }

  return (
    <>
      {messages.map((message, index) => {
        const next = messages[index + 1];
        const isLastOfGroup = !next || next.sender !== message.sender;
        const isLastOverall = index === messages.length - 1;
        return (
          <div key={message.id} className={isLastOfGroup ? "mb-1.5" : ""}>
            <MessageBubble
              message={message}
              showTail={isLastOfGroup}
              showStatus={isLastOverall && message.sender === "me"}
              onTextChange={onTextChange ? (text) => onTextChange(message.id, text) : undefined}
            />
          </div>
        );
      })}
    </>
  );
}

export default function PhoneFrame({
  contactName,
  avatarImage,
  avatarColor,
  time,
  battery,
  messages,
  onSend,
  onSendImage,
  onTextChange,
  fullscreen = false,
  onBackgroundTap,
  onBack,
}: PhoneFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (fullscreen) {
    // No fake status bar here: the phone's own real status bar (time, signal,
    // wifi, battery) already sits above the page, so drawing one would just
    // duplicate — and mismatch — what's really there.
    return (
      <div
        onClick={() => onBackgroundTap?.()}
        className="fixed inset-0 bg-white flex flex-col select-none"
        style={{ height: "100dvh", paddingTop: "env(safe-area-inset-top)" }}
      >
        <ChatHeader contactName={contactName} avatarImage={avatarImage} avatarColor={avatarColor} onBack={onBack} />

        <div
          ref={scrollRef}
          className="no-scrollbar flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-[3px] bg-white"
          style={{ ["--chat-bg" as string]: "#ffffff" }}
        >
          <MessageList messages={messages} onTextChange={onTextChange} />
        </div>

        <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <Composer onSend={onSend} onSendImage={onSendImage} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[375px] h-[812px] rounded-[55px] bg-black p-[14px] shadow-2xl select-none">
      <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-white flex flex-col">
        {/* notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[18px] z-20" />

        <StatusBar time={time ?? ""} battery={battery ?? 100} />
        <ChatHeader contactName={contactName} avatarImage={avatarImage} avatarColor={avatarColor} onBack={onBack} />

        <div
          ref={scrollRef}
          className="no-scrollbar flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-[3px] bg-white"
          style={{ ["--chat-bg" as string]: "#ffffff" }}
        >
          <MessageList messages={messages} onTextChange={onTextChange} />
        </div>

        <Composer onSend={onSend} onSendImage={onSendImage} />

        {/* home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black/80" />
      </div>
    </div>
  );
}
