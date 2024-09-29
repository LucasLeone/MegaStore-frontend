"use client";

import "@/styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100">
          <div className="flex">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}