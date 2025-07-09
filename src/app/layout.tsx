"use client";
import "./globals.css";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./web3authContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3AuthProvider config={web3AuthContextConfig}>
          {children}
        </Web3AuthProvider>
      </body>
    </html>
  );
}
