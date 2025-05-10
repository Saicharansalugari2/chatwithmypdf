export const runtime = "nodejs"; // Force Node.js runtime

import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai"; // ✅ Correct import

// Define the Message type
type Message = {
  role: "user" | "system" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    const systemPrompt: Message = {
      role: "system",
      content: `AI assistant is an advanced, knowledgeable, and articulate AI system.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      If the context does not provide the answer, AI assistant will respond with "I'm sorry, but I don't know the answer."`,
    };

    // Use 'messages' instead of 'prompt'
    const result = await streamText({
      model: openai("gpt-3.5-turbo"), // ✅ Correct usage
      messages: [
        systemPrompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
    });

    return result.toDataStreamResponse(); // ✅ Correct streaming response

  } catch (error) {
    console.error("Error in chat completion:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
