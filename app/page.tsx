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

// Per-character delay for the autotype effect on my own messages — a bit of
// human-like rhythm: quick between letters, a small breath after spaces, a
// longer beat after sentence-ending punctuation.
function nextCharDelay(char: string) {
  if (/[.!?]/.test(char)) return 260 + Math.random() * 220;
  if (char === ",") return 160 + Math.random() * 120;
  if (char === " ") return 25 + Math.random() * 40;
  return 30 + Math.random() * 55;
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
  const [isTyping, setIsTyping] = useState(false);
  const [autotypeText, setAutotypeText] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autotypeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
    if (autotypeTimeoutRef.current) {
      clearTimeout(autotypeTimeoutRef.current);
      autotypeTimeoutRef.current = null;
    }
    setAutotypeText(null);
  };

  // Types my own message into the composer letter by letter, then sends it
  // — so a screen recording shows a real-looking typing moment instead of
  // the bubble just popping into existence.
  const startAutotype = (message: ChatMessage) => {
    const fullText = message.text;
    setAutotypeText("");
    let i = 0;
    const typeNextChar = () => {
      i++;
      setAutotypeText(fullText.slice(0, i));
      if (i < fullText.length) {
        autotypeTimeoutRef.current = setTimeout(typeNextChar, nextCharDelay(fullText[i - 1]));
      } else {
        autotypeTimeoutRef.current = setTimeout(() => {
          autotypeTimeoutRef.current = null;
          setAutotypeText(null);
          setRevealedCount((c) => Math.min(c + 1, messages.length));
        }, 450);
      }
    };
    autotypeTimeoutRef.current = setTimeout(typeNextChar, 200 + Math.random() * 150);
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

  // Mobile prep: adds to the script queue without revealing it yet.
  const handleAddToScript = (sender: Sender, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), sender, text, readAt: sender === "me" ? currentTime() : undefined },
    ]);
  };

  // Mobile present composer: inserts right after the last revealed message and reveals it immediately.
  const handlePresentSend = (text: string) => {
    cancelPendingTyping();
    const newMessage: ChatMessage = {
      id: genId(),
      sender: activeSender,
      text,
      readAt: activeSender === "me" ? currentTime() : undefined,
    };
    setMessages((prev) => {
      const copy = [...prev];
      copy.splice(revealedCount, 0, newMessage);
      return copy;
    });
    setRevealedCount((c) => c + 1);
  };

  const handlePresentSendImage = (dataUrl: string) => {
    cancelPendingTyping();
    const newMessage: ChatMessage = {
      id: genId(),
      sender: activeSender,
      text: "",
      image: dataUrl,
      readAt: activeSender === "me" ? currentTime() : undefined,
    };
    setMessages((prev) => {
      const copy = [...prev];
      copy.splice(revealedCount, 0, newMessage);
      return copy;
    });
    setRevealedCount((c) => c + 1);
  };

  // Tapping the screen reveals the next scripted message. Messages from the
  // other person first show a "typing…" bubble for a bit — timed roughly to
  // their length — before the real message replaces it. My own messages get
  // typed into the composer letter by letter and then sent automatically,
  // so it actually looks like I'm writing it live.
  const handleRevealNext = () => {
    if (isTyping || autotypeText !== null) return;
    const next = messages[revealedCount];
    if (!next) return;
    if (next.sender === "me") {
      if (next.image || !next.text) {
        setRevealedCount((c) => Math.min(c + 1, messages.length));
      } else {
        startAutotype(next);
      }
      return;
    }
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
      setIsTyping(false);
      setRevealedCount((c) => Math.min(c + 1, messages.length));
    }, typingDelayFor(next));
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
  };

  const handleResetPlayback = () => {
    cancelPendingTyping();
    setRevealedCount(0);
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
            onResetPlayback={handleResetPlayback}
            onClearAll={handleClearAll}
            onStartRecording={() => setMode("present")}
          />
        ) : (
          <MobilePresent
            contactName={contactName}
            avatarImage={avatarImage}
            avatarColor={avatarColor}
            visibleMessages={messages.slice(0, revealedCount)}
            isTyping={isTyping}
            autotypeText={autotypeText}
            onSend={handlePresentSend}
            onSendImage={handlePresentSendImage}
            onRevealNext={handleRevealNext}
            onExit={handleExitPresent}
          />
        )}
      </div>
    </>
  );
}
