import { ChatMessage, Sender } from "@/lib/types";
import PhoneFrame from "./PhoneFrame";

interface MobilePresentProps {
  contactName: string;
  avatarImage: string | null;
  avatarColor: string;
  visibleMessages: ChatMessage[];
  activeSender: Sender;
  onSend: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  onRevealNext: () => void;
  onExit: () => void;
}

export default function MobilePresent({
  contactName,
  avatarImage,
  avatarColor,
  visibleMessages,
  activeSender,
  onSend,
  onSendImage,
  onRevealNext,
  onExit,
}: MobilePresentProps) {
  return (
    <PhoneFrame
      fullscreen
      contactName={contactName}
      avatarImage={avatarImage}
      avatarColor={avatarColor}
      messages={visibleMessages}
      activeSender={activeSender}
      onSend={onSend}
      onSendImage={onSendImage}
      onBackgroundTap={onRevealNext}
      onBack={onExit}
    />
  );
}
