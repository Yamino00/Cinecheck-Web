"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Search,
  Film,
  Tv,
  Star,
  User,
  Trophy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Discover", icon: Search },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "Series", icon: Tv },
    { href: "/watchlist", label: "Watchlist", icon: Star, requireAuth: true },
    { href: "/profile", label: "Profile", icon: User, requireAuth: true },
    {
      href: "/achievements",
      label: "Achievements",
      icon: Trophy,
      requireAuth: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "256px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-netflix-dark-950 border-r border-netflix-dark-800 flex-col z-40"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-netflix-dark-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-netflix-600 flex items-center justify-center flex-shrink-0">
              <Film className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold text-netflix-600 whitespace-nowrap overflow-hidden"
                >
                  Cinecheck
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-netflix-dark-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {navigationItems.map((item) => {
            if (item.requireAuth && !user) return null;

            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      active
                        ? "bg-netflix-600/20 text-netflix-600"
                        : "text-gray-400 hover:text-white hover:bg-netflix-dark-800"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-netflix-600 rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Icon with glow effect */}
                  <div
                    className={`
                    flex-shrink-0 w-6 h-6
                    ${active ? "drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]" : ""}
                  `}
                  >
                    <Icon className="w-full h-full" />
                  </div>

                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Glow effect on hover */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 bg-netflix-600/10 rounded-lg blur-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-netflix-dark-800 p-4">
          {user ? (
            <div className="space-y-3">
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg
                    ${
                      isActive("/profile")
                        ? "bg-netflix-dark-800"
                        : "hover:bg-netflix-dark-800"
                    }
                    transition-colors
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-netflix-600 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm font-medium text-white truncate">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          View profile
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
              <button
                onClick={signOut}
                className={`
                  flex items-center gap-3 w-full p-3 rounded-lg
                  text-gray-400 hover:text-red-400 hover:bg-red-500/10
                  transition-colors
                `}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 w-full p-3 rounded-lg bg-netflix-600 hover:bg-netflix-700 text-white transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>
          )}
        </div>
      </motion.aside>
    </>
  );
}
