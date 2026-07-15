export type Sender = "me" | "them";

export type MessageStatus = "delivered" | "read";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  status?: MessageStatus;
  readAt?: string;
}
