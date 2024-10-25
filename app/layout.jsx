"use client";

import "@/styles/globals.css";
import NavbarHome from "./components/Navbar";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  const url = usePathname().split("/")[1];
  const fullPath = usePathname();
  return (
    <html lang="en">
      <body>
        <Toaster />
        {url !== "dashboard" && fullPath !== "/auth/login" && <NavbarHome />}
        {children}
      </body>
    </html>
  );
}
