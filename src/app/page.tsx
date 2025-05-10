import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import VideoPreview from "@/components/VideoPreview"; // Import the VideoPreview component

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();

  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  return (
    <div className="w-screen min-h-screen bg-black flex justify-center items-center">
      <div className="flex flex-col items-center text-center space-y-12">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-r from-[#C0C0C0] to-[#8A8A8A] bg-clip-text uppercase font-sans">
            Chat with any PDF
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        {isAuth && (
          <div className="flex space-x-4 mt-6">
            {firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button className="bg-gradient-to-r from-[#C0C0C0] to-[#8A8A8A] font-semibold text-lg py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out hover:bg-gradient-to-r hover:from-[#A0A0A0] hover:to-[#B0B0B0]">
                  <span className="bg-gradient-to-r from-[#808080] to-[#555555] bg-clip-text text-transparent">
                    Go to Previous Chats
                  </span>
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            )}
            <SubscriptionButton isPro={isPro} />
          </div>
        )}

        <p className="max-w-xl text-lg font-medium font-roboto text-[#D3D3D3] mt-6">
          Join now to chat with PDFs using AI
          <br />
          Instantly unlock insights and answer questions with ease!
        </p>

        {!isAuth ? (
          <div className="flex flex-col items-center gap-8 mt-8">
            <div className="flex justify-center gap-8">
              <Link href="/sign-up">
                <Button className="bg-white text-black font-mono font-semibold text-lg py-3 px-6 rounded-xl shadow-md transition duration-200 ease-in-out hover:bg-black hover:text-white">
                  Sign Up to Get Started!
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>

              <Link href="/sign-in">
                <Button className="bg-white text-black font-mono font-semibold text-lg py-3 px-6 rounded-xl shadow-md transition duration-200 ease-in-out hover:bg-black hover:text-white">
                  Already have an account? Sign In
                  <LogIn className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Video Section */}
            <VideoPreview /> {/* Added VideoPreview component */}
          </div>
        ) : (
          <div className="w-full mt-8 max-w-4xl">
            <FileUpload />
          </div>
        )}
      </div>
    </div>
  );
}
