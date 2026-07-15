export default function TypingIndicator() {
  return (
    <div className="flex flex-col items-start mb-1.5">
      <div className="imessage-bubble-in bubble-tail-received relative bg-[#E9E9EB] rounded-[18px] px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
