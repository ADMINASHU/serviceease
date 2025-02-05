import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import { DataProvider } from "../context/DataContext";
import { UserProviderComponent } from "../components/UserProviderComponent";
import { CPProviderComponent } from "@/components/CPProviderComponent";
import { DataProviderComponent } from "@/components/DataProviderComponent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <UserProviderComponent>
            <DataProviderComponent>
              <CPProviderComponent>{children}</CPProviderComponent>
            </DataProviderComponent>
          </UserProviderComponent>
        </DataProvider>
      </body>
    </html>
  );
}
