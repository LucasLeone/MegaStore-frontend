"use client";

import "@/styles/globals.css";
import NavbarHome from "./components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const url = usePathname().split("/")[1];
  return (
    <html lang="en">
      <body>
        {url !== "dashboard" && <NavbarHome />}
        {children}
      </body>
    </html>
  );
}
