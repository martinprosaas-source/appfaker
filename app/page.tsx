"use client";

import { useState } from "react";
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

export default function Home() {
  const [contactName, setContactName] = useState("Marie");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState("#9A9A9E");
  const [time, setTime] = useState(currentTime());
  const [battery, setBattery] = useState(82);
  const [activeSender, setActiveSender] = useState<Sender>("them");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [mode, setMode] = useState<"prep" | "present">("prep");

  // Desktop composer: always appends and is immediately visible.
  const handleDesktopSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), sender: activeSender, text, status: activeSender === "me" ? "delivered" : undefined },
    ]);
  };

  // Mobile prep: adds to the script queue without revealing it yet.
  const handleAddToScript = (sender: Sender, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), sender, text, status: sender === "me" ? "delivered" : undefined },
    ]);
  };

  // Mobile present composer: inserts right after the last revealed message and reveals it immediately.
  const handlePresentSend = (text: string) => {
    const newMessage: ChatMessage = {
      id: genId(),
      sender: activeSender,
      text,
      status: activeSender === "me" ? "delivered" : undefined,
    };
    setMessages((prev) => {
      const copy = [...prev];
      copy.splice(revealedCount, 0, newMessage);
      return copy;
    });
    setRevealedCount((c) => c + 1);
  };

  const handleRevealNext = () => {
    setRevealedCount((c) => Math.min(c + 1, messages.length));
  };

  const handleStatusClick = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === "delivered" ? "read" : "delivered",
              readAt: m.status === "delivered" ? currentTime() : undefined,
            }
          : m
      )
    );
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
    setMessages([]);
    setRevealedCount(0);
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
          activeSender={activeSender}
          onSend={handleDesktopSend}
          onStatusClick={handleStatusClick}
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

      {/* Mobile: prepare the script, then record fullscreen */}
      <div className="flex-1 w-full md:hidden">
        {mode === "prep" ? (
          <MobilePrep
            contactName={contactName}
            setContactName={setContactName}
            avatarImage={avatarImage}
            setAvatarImage={setAvatarImage}
            avatarColor={avatarColor}
            setAvatarColor={setAvatarColor}
            messages={messages}
            revealedCount={revealedCount}
            onAddToScript={handleAddToScript}
            onDeleteMessage={handleDeleteMessage}
            onMoveMessage={handleMoveMessage}
            onResetPlayback={() => setRevealedCount(0)}
            onClearAll={handleClearAll}
            onStartRecording={() => setMode("present")}
          />
        ) : (
          <MobilePresent
            contactName={contactName}
            avatarImage={avatarImage}
            avatarColor={avatarColor}
            visibleMessages={messages.slice(0, revealedCount)}
            activeSender={activeSender}
            onSend={handlePresentSend}
            onStatusClick={handleStatusClick}
            onRevealNext={handleRevealNext}
            onExit={() => setMode("prep")}
          />
        )}
      </div>
    </>
  );
}
