import { ChatMessage } from "@/lib/types";
import PhoneFrame from "./PhoneFrame";

interface MobilePresentProps {
  contactName: string;
  avatarImage: string | null;
  avatarColor: string;
  conversation: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  onExit: () => void;
}

export default function MobilePresent({
  contactName,
  avatarImage,
  avatarColor,
  conversation,
  isTyping,
  onSend,
  onSendImage,
  onExit,
}: MobilePresentProps) {
  return (
    <PhoneFrame
      fullscreen
      contactName={contactName}
      avatarImage={avatarImage}
      avatarColor={avatarColor}
      messages={conversation}
      isTyping={isTyping}
      onSend={onSend}
      onSendImage={onSendImage}
      onBack={onExit}
    />
  );
}
