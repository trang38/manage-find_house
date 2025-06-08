import React, { useEffect, useState } from "react";
import { fetchInbox, Message } from "./interface_type";
interface ChatInboxProps {
  userId: any;
onSelect: (partner: {
    id: number;
    image?: string | File | null;
    full_name?: string | null;
  }) => void;
}

const ChatInbox: React.FC<ChatInboxProps> = ({ userId, onSelect }) => {
  const [inbox, setInbox] = useState<Message[]>([]);

  useEffect(() => {
    fetchInbox(userId).then(setInbox);
  }, [userId]);

  return (
    <div>
      <ul className="flex flex-col gap-[0.5rem] w-full">
        {inbox.map((msg) => (
          <li key={msg.id} onClick={() => onSelect({
            id: msg.sender.id === userId ? msg.receiver.id : msg.sender.id,
            image: msg.sender.id === userId ? msg.receiver_profile?.image : msg.sender_profile?.image,
            full_name: msg.sender.id === userId ? msg.receiver_profile?.full_name : msg.sender_profile?.full_name,
            })} className="flex flex-row items-center gap-[0.3rem] w-full cursor-pointer">
            <div className="w-[3rem] h-[3rem] rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={
                    (() => {
                      const img = msg.sender.id === userId ? msg.receiver_profile?.image : msg.sender_profile?.image;
                      if (typeof img === "string" || typeof img === "undefined") {
                        return img;
                      }
                      if (img instanceof File) {
                        return URL.createObjectURL(img);
                      }
                      return undefined;
                    })()
                  }
                  alt={msg.sender.id === userId ? msg.receiver?.username : msg.sender?.username}
                />
            </div>
            <div className="flex flex-col max-w-[11.5rem] text-start">
            <b className="truncate overflow-hidden w-full">{msg.sender.id === userId ? msg.receiver_profile?.full_name : msg.sender_profile?.full_name}</b>
            <p className="truncate overflow-hidden w-full">{msg.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatInbox;