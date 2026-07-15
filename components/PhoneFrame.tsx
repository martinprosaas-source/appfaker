import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/types";
import StatusBar from "./StatusBar";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";
import TypingIndicator from "./TypingIndicator";

interface PhoneFrameProps {
  contactName: string;
  avatarImage: string | null;
  avatarColor: string;
  time?: string;
  battery?: number;
  messages: ChatMessage[];
  isTyping?: boolean;
  onSend: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  onTextChange?: (id: string, text: string) => void;
  fullscreen?: boolean;
  onBack?: () => void;
}

function MessageList({
  messages,
  isTyping,
  onTextChange,
}: {
  messages: ChatMessage[];
  isTyping?: boolean;
  onTextChange?: (id: string, text: string) => void;
}) {
  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center text-black/30 text-sm text-center px-8">
        Envoie ton premier message en bas pour démarrer la conversation
      </div>
    );
  }

  return (
    <>
      {messages.map((message, index) => {
        const next = messages[index + 1];
        const isLastOverall = index === messages.length - 1;
        // A pending "typing…" bubble for the other person takes over the
        // last-of-group tail from the real message that precedes it.
        const isLastOfGroup = !next ? !(isTyping && message.sender === "them") : next.sender !== message.sender;
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
      {isTyping && <TypingIndicator />}
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
  isTyping = false,
  onSend,
  onSendImage,
  onTextChange,
  fullscreen = false,
  onBack,
}: PhoneFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Tracks the real visible area (window.visualViewport), which shrinks
  // when the on-screen keyboard opens — unlike 100dvh, which on iOS Safari
  // doesn't reliably follow the keyboard for a `position: fixed` element.
  // Without this, focusing the composer can leave the message list rendered
  // behind the keyboard instead of shrinking to stay visible above it.
  const [viewport, setViewport] = useState<{ height: number; top: number } | null>(null);

  useEffect(() => {
    if (!fullscreen) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setViewport({ height: vv.height, top: vv.offsetTop });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [fullscreen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping, viewport]);

  if (fullscreen) {
    // No fake status bar here: the phone's own real status bar (time, signal,
    // wifi, battery) already sits above the page, so drawing one would just
    // duplicate — and mismatch — what's really there.
    return (
      <div
        className="fixed inset-x-0 bg-white flex flex-col select-none"
        style={{
          top: viewport ? viewport.top : 0,
          height: viewport ? viewport.height : "100dvh",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <ChatHeader contactName={contactName} avatarImage={avatarImage} avatarColor={avatarColor} onBack={onBack} />

        <div
          ref={scrollRef}
          className="no-scrollbar flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-[3px] bg-white"
          style={{ ["--chat-bg" as string]: "#ffffff" }}
        >
          <MessageList messages={messages} isTyping={isTyping} onTextChange={onTextChange} />
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
