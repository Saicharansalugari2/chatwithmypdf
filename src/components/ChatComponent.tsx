"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="relative flex flex-col h-screen w-full bg-black" id="message-container">
      {/* Header */}
      <div className="flex justify-center w-full">
  <p className="text-transparent bg-gradient-to-r from-[#C0C0C0] to-[#8A8A8A] bg-clip-text font-normal text-4xl uppercase tracking-widest shadow-lg shadow-[#D3D3D3]">
    CHAT WITH PDF-AI
  </p>
</div>

      {/* Message List */}
      <div className="flex-1 overflow-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input & Send Button */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 inset-x-0 px-2 py-4 bg-black z-10">
        <div className="flex items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question about this PDF..."
            className="w-full bg-gray-800 text-white text-lg py-3 px-4 border border-gray-700 rounded-full"
          />
          <Button className="bg-blue-600 ml-2 h-16 px-6 py-3 text-lg text-white border border-gray-700 rounded-lg">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
