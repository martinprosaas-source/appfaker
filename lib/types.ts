export type Sender = "me" | "them";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  image?: string;
  readAt?: string;
}
