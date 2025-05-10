"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="w-full max-h-screen overflow-scroll soff p-4 text-[#D3D3D3] bg-black">
    <Link href="/">
      <Button className="w-full bg-white text-black border-dashed border-black border hover:bg-white hover:text-black hover:border-black">
        <PlusCircle className="mr-2 w-4 h-4" />
        New Chat
      </Button>
    </Link>  
      <div className="flex max-h-screen overflow-scroll pb-20 flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-[#D3D3D3] flex items-center", {
                "bg-[#C0C0C0] text-black": chat.id === chatId, // Active chat with black text and silver background
                "hover:text-black hover:bg-[#C0C0C0]": chat.id !== chatId, // Hover state with black text and silver background
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;
