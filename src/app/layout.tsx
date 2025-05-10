import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import ToasterClient from "@/lib/ToasterClient";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>CHATWITHPDF</title>
      </head>
      <body className={inter.className}>
        <ClerkProvider>
          <Providers>
            {children}
            <ToasterClient />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
