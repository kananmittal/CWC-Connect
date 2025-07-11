"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Menu } from 'lucide-react';
import CwcSearchBar from "./CwcSearchBar";
import CwcSidebar from "./CwcSidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on ESC key
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white relative overflow-x-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-auto">
            <CwcSidebar />
          </div>
        </>
      )}
      
      {/* Header - Responsive */}
      <header className="relative z-10 h-14 sm:h-16 flex items-center px-3 sm:px-4 lg:px-6 shadow-lg shrink-0" style={{backgroundColor: '#1fb1da'}}>
        <button
          className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </button>
        <h1 className="flex-1 text-center text-white font-bold text-xl sm:text-2xl lg:text-3xl tracking-wide -ml-6 sm:-ml-8">
          CWC CONNECT
        </h1>
      </header>

      {/* Main Content Area - Responsive Layout */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-0">
        
        {/* Logo Container - Properly Centered */}
        <div className="flex-1 flex items-center justify-center w-full max-w-lg mb-6 sm:mb-8">
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[420px]">
            <Image
              src="/image.png"
              alt="Central Water Commission Logo"
              fill
              className="object-contain opacity-15"
              priority
              sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 380px, 420px"
            />
          </div>
        </div>

        {/* Search Bar Container - Responsive */}
        <div className="w-full max-w-5xl">
          <CwcSearchBar />
        </div>
      </div>
    </main>
  );
}
