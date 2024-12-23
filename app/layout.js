import localFont from "next/font/local";
import "./globals.css";
// app/layout.js
import React from "react";
import { DataProvider } from "../context/DataContext";
import DataProviderComponent from "../components/DataProviderComponent";
import { UserProviderComponent } from "../components/UserProviderComponent"; // Ensure this path is correct

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
              {children}
              </DataProviderComponent>
          </UserProviderComponent>
        </DataProvider>
      </body>
    </html>
  );
}
