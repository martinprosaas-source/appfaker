"use client";

import { useRef, useState } from "react";
import { ChatMessage, Sender } from "@/lib/types";
import PhoneFrame from "@/components/PhoneFrame";
import ControlPanel from "@/components/ControlPanel";
import MobilePrep from "@/components/MobilePrep";
import MobilePresent from "@/components/MobilePresent";

function currentTime() {
  const now = new Date();
  return now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// Simulates how long the other person would take to type a message: a
// little longer for longer messages, clamped to a believable range.
function typingDelayFor(message: ChatMessage) {
  if (message.image) return 1400;
  return Math.min(3200, Math.max(700, 350 + message.text.length * 35));
}

export default function Home() {
  const [contactName, setContactName] = useState("Marie");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState("#9A9A9E");
  const [time, setTime] = useState(currentTime());
  const [battery, setBattery] = useState(82);
  const [activeSender, setActiveSender] = useState<Sender>("them");
  // The script, written in advance: only the other person's messages.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  // The actual conversation as it unfolds in present mode: my live-sent
  // messages interleaved with the other person's auto-revealed replies.
  const [conversationLog, setConversationLog] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"prep" | "present">("prep");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
  };

  // Desktop composer: always appends and is immediately visible.
  const handleDesktopSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), sender: activeSender, text, readAt: activeSender === "me" ? currentTime() : undefined },
    ]);
  };

  const handleDesktopSendImage = (dataUrl: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: genId(),
        sender: activeSender,
        text: "",
        image: dataUrl,
        readAt: activeSender === "me" ? currentTime() : undefined,
      },
    ]);
  };

  // Mobile prep: adds one of the contact's messages to the script.
  const handleAddToScript = (text: string) => {
    setMessages((prev) => [...prev, { id: genId(), sender: "them", text }]);
  };

  // After I send a message live, the contact automatically replies with the
  // next scripted message — typing bubble first, timed to its length.
  const triggerAutoReply = () => {
    if (isTyping) return;
    const next = messages[revealedCount];
    if (!next) return;
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
      setIsTyping(false);
      setConversationLog((prev) => [...prev, next]);
      setRevealedCount((c) => c + 1);
    }, typingDelayFor(next));
  };

  // Mobile present composer: this is me, typing for real, so it just sends —
  // then the contact's next scripted reply kicks in automatically.
  const handlePresentSend = (text: string) => {
    setConversationLog((prev) => [...prev, { id: genId(), sender: "me", text, readAt: currentTime() }]);
    triggerAutoReply();
  };

  const handlePresentSendImage = (dataUrl: string) => {
    setConversationLog((prev) => [
      ...prev,
      { id: genId(), sender: "me", text: "", image: dataUrl, readAt: currentTime() },
    ]);
    triggerAutoReply();
  };

  const handleTextChange = (id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === id);
      if (index === -1) return prev;
      if (index < revealedCount) setRevealedCount((c) => Math.max(0, c - 1));
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleMoveMessage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= messages.length) return;
    setMessages((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  };

  const handleClearAll = () => {
    cancelPendingTyping();
    setMessages([]);
    setRevealedCount(0);
    setConversationLog([]);
  };

  const handleResetPlayback = () => {
    cancelPendingTyping();
    setRevealedCount(0);
    setConversationLog([]);
  };

  const handleExitPresent = () => {
    cancelPendingTyping();
    setMode("prep");
  };

  return (
    <>
      {/* Desktop: bezel mockup + control panel */}
      <div className="hidden md:flex flex-1 bg-[#e9e9ee] items-center justify-center gap-12 px-8 py-12 flex-wrap">
        <PhoneFrame
          contactName={contactName}
          avatarImage={avatarImage}
          avatarColor={avatarColor}
          time={time}
          battery={battery}
          messages={messages}
          onSend={handleDesktopSend}
          onSendImage={handleDesktopSendImage}
          onTextChange={handleTextChange}
        />
        <ControlPanel
          contactName={contactName}
          setContactName={setContactName}
          avatarImage={avatarImage}
          setAvatarImage={setAvatarImage}
          avatarColor={avatarColor}
          setAvatarColor={setAvatarColor}
          time={time}
          setTime={setTime}
          battery={battery}
          setBattery={setBattery}
          activeSender={activeSender}
          setActiveSender={setActiveSender}
          messages={messages}
          onDeleteMessage={handleDeleteMessage}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Mobile: prepare the other person's script, then record fullscreen */}
      <div className="flex-1 w-full md:hidden">
        {mode === "prep" ? (
          <MobilePrep
            contactName={contactName}
            setContactName={setContactName}
            avatarImage={avatarImage}
            setAvatarImage={setAvatarImage}
            avatarColor={avatarColor}
            setAvatarColor={setAvatarColor}
            script={messages}
            revealedCount={revealedCount}
            onAddToScript={handleAddToScript}
            onDeleteMessage={handleDeleteMessage}
            onMoveMessage={handleMoveMessage}
            onResetPlayback={handleResetPlayback}
            onClearAll={handleClearAll}
            onStartRecording={() => setMode("present")}
          />
        ) : (
          <MobilePresent
            contactName={contactName}
            avatarImage={avatarImage}
            avatarColor={avatarColor}
            conversation={conversationLog}
            isTyping={isTyping}
            onSend={handlePresentSend}
            onSendImage={handlePresentSendImage}
            onExit={handleExitPresent}
          />
        )}
      </div>
    </>
  );
}
