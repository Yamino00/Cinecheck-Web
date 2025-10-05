"use client";

import { motion } from "framer-motion";
import { Menu, Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:hidden sticky top-0 z-30 w-full h-16 bg-cinema-dark-950/80 backdrop-blur-xl border-b border-cinema-dark-800"
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-cinema-dark-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-300" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-cinema-purple-400 to-cinema-amber-400 bg-clip-text text-transparent">
            Cinecheck
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-2 rounded-lg hover:bg-cinema-dark-800 transition-colors"
          >
            <Search className="w-6 h-6 text-gray-300" />
          </Link>

          {user && (
            <button className="relative p-2 rounded-lg hover:bg-cinema-dark-800 transition-colors">
              <Bell className="w-6 h-6 text-gray-300" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
