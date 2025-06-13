import React, { useEffect, useRef, useState } from "react";
import { Infor, Message } from ".././interface_type";
import { getCSRFToken } from "../../utils/cookies";
import axios from "axios";

interface ChatBoxProps {
  userId: any;
  partnerId: number;
  partnerImage?: string | File;
  partnerFullName?: string;
}
const csrftoken = getCSRFToken();
export const fetchMessages = async (senderId: number, receiverId: number) => {
  const res = await axios.get<Message[]>(`${process.env.REACT_APP_API_URL}/api/get-messages/${senderId}/${receiverId}/`,
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrftoken || '',
      }
    }
  );
  return res.data;
};

export const sendMessage = async (sender: number, receiver: number, message: string) => {
  const res = await axios.post<Message>(`${process.env.REACT_APP_API_URL}/api/send-messages/`, {
    sender,
    receiver,
    message,
  },
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrftoken || '',
      }
    }
  );
  return res.data;
};
const ChatBox: React.FC<ChatBoxProps> = ({ userId, partnerId, partnerImage, partnerFullName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [partner, setPartner] = useState<Infor>();

  useEffect(() => {
    fetchMessages(userId, partnerId).then(setMessages);
  }, [userId, partnerId]);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchMessages(userId, partnerId).then(setMessages);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [userId, partnerId]);


  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(userId, partnerId, input);
    setInput("");
    fetchMessages(userId, partnerId).then(setMessages);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="w-full h-full p-4 relative py-[4rem] ">
      <div className="flex flex-row w-full absolute top-0 left-0 right-0 p-2 bg-white items-center gap-2 ">
        <img src={partnerImage instanceof File ? URL.createObjectURL(partnerImage) : partnerImage} alt='' className="w-[1.8rem] h-[1.8rem] rounded-full object-cover flex-0" />
        <h1 className="text-[#228B22] ml-[0.5rem] text-xl font-bold">
          {partnerFullName}
        </h1>
      </div>
      <div ref={chatContainerRef}  className="overflow-y-auto h-full flex flex-col gap-[0.5rem] px-[0.5rem] pb-[1rem]">
        {messages.map((msg) => {
          const isOwn = msg.sender.id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`${isOwn ? "bg-[#00b14f]" : "bg-gray-500"
                  } text-white rounded-xl max-w-[60%] px-4 py-2 break-words`}
              >
                <span className="block">{msg.message}</span>
                <small className="block text-[10px] mt-[5px] text-right opacity-80">
                  {new Date(msg.date).toLocaleString()}
                </small>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white flex items-center gap-2 flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border pl-1 py-1 rounded"
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={handleSend} className="w-[2rem] h-[2rem]">
          <img src={process.env.PUBLIC_URL + '/icons8-send-30.png'} alt="Gửi" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;