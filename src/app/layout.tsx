import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSession } from "next-auth/react";
import NextSessionProvider from "@/provider/NextSessionProvider";
import QueryProvider from "@/provider/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlogApp",
  description: "Welcome to BlogApp",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession(); 

  return (
    <NextSessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider> 
        </body>
      </html>
    </NextSessionProvider>
  );
}
