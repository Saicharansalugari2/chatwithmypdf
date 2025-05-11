import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";  
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const user = await currentUser();  // Used the currentUser() for server-side user fetching

  if (!user) {
    return redirect("/sign-in");
  }

  const { id: userId } = user;

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats || _chats.length === 0) {
    return redirect("/");
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  const isPro = await checkSubscription();

  return (
    <div className="flex max-h-screen overflow-scroll bg-black text-white"> {/* Changed to Gray background for the entire page */}
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* Chat sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>
        {/* PDF viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        {/* Chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200 bg-black"> {/* Changed to black bg */}
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
