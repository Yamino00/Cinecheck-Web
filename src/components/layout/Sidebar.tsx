"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Search,
  Menu,
  X,
  LogOut,
  LogIn,
  TrendingUp,
  Star,
  Clock,
  Play,
} from "lucide-react";
import CinecheckLogo from "../ui/CinecheckLogo";

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
    {
      href: "/",
      label: "Home",
      icon: Home,
      badge: null,
    },
    {
      href: "/search",
      label: "Discover",
      icon: Search,
      badge: "New",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay when sidebar is collapsed */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block fixed left-0 top-0 w-20 h-screen bg-gradient-to-r from-netflix-dark-950/80 to-transparent z-30 pointer-events-none"
        />
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "320px",
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-gradient-to-b from-netflix-dark-950 via-netflix-dark-900 to-netflix-dark-950 flex-col z-40 shadow-2xl border-r border-netflix-dark-800/50"
      >
        {/* Header Section */}
        <motion.div
          className="relative p-6 border-b border-netflix-dark-800/30"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-netflix-600/5 via-transparent to-netflix-600/5" />

          <div
            className={`relative flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <Link
              href="/"
              className={`flex items-center group ${
                isCollapsed ? "justify-center" : "gap-4"
              }`}
            >
              {/* Logo Container */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-netflix-600/30">
                  <CinecheckLogo size="sm" showText={false} animated={false} />
                </div>
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-netflix-600 to-netflix-700 blur-lg opacity-0 group-hover:opacity-60"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="overflow-hidden"
                  >
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-netflix-600 to-white bg-clip-text text-transparent">
                      Cinecheck
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-400 font-medium">
                        Verified Reviews
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Toggle Button */}
            {!isCollapsed && (
              <motion.button
                onClick={toggleCollapse}
                className="p-3 rounded-xl bg-netflix-dark-800/50 hover:bg-netflix-dark-800 transition-all duration-200 group backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Collapse sidebar"
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </motion.div>
              </motion.button>
            )}
          </div>

          {/* Toggle Button for Collapsed State */}
          {isCollapsed && (
            <motion.button
              onClick={toggleCollapse}
              className="mt-4 p-2 rounded-xl bg-netflix-dark-800/50 hover:bg-netflix-dark-800 transition-all duration-200 group backdrop-blur-sm mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Expand sidebar"
            >
              <Menu className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </motion.button>
          )}
        </motion.div>

        {/* Navigation Section */}
        <nav
          className={`flex-1 overflow-y-auto py-8 space-y-2 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          {navigationItems.map((item, index) => {
            if (item.requireAuth && !user) return null;

            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      x: isCollapsed ? 0 : 6,
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                       relative flex items-center rounded-2xl transition-all duration-300 group cursor-pointer
                       ${
                         isCollapsed
                           ? "justify-center px-2 py-4"
                           : "gap-4 px-5 py-4"
                       }
                       ${
                         active
                           ? "bg-gradient-to-r from-netflix-600/30 to-netflix-600/10 text-white shadow-lg shadow-netflix-600/20 border border-netflix-600/20"
                           : "text-gray-400 hover:text-white hover:bg-netflix-dark-800/40 hover:border-netflix-dark-700/50 border border-transparent"
                       }
                     `}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-8 bg-gradient-to-b from-netflix-600 to-netflix-500 rounded-r-full shadow-lg shadow-netflix-600/50 ${
                          isCollapsed ? "left-0 w-0.5" : "left-0 w-1"
                        }`}
                      />
                    )}

                    {/* Icon Container */}
                    <div
                      className={`relative flex-shrink-0 ${
                        isCollapsed ? "mx-auto" : ""
                      }`}
                    >
                      <motion.div
                        className={`
                          ${
                            isCollapsed ? "w-10 h-10" : "w-7 h-7"
                          } flex items-center justify-center rounded-xl transition-all duration-300
                          ${
                            active
                              ? "bg-netflix-600/20 shadow-lg shadow-netflix-600/30"
                              : "group-hover:bg-netflix-dark-700/50"
                          }
                        `}
                        animate={{
                          scale: active ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.icon === "CinecheckLogo" ? (
                          <CinecheckLogo
                            size="sm"
                            showText={false}
                            animated={false}
                          />
                        ) : (
                          <Icon
                            className={`${
                              isCollapsed ? "w-6 h-6" : "w-5 h-5"
                            } ${active ? "text-netflix-600" : "text-current"}`}
                          />
                        )}
                      </motion.div>

                      {/* Pulse effect for active items */}
                      {active && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-netflix-600/20"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Label and Badge */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden flex-1 flex items-center justify-between"
                        >
                          <span className="font-semibold text-sm">
                            {item.label}
                          </span>

                          {/* Badge */}
                          {item.badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`
                                 px-2 py-1 rounded-full text-xs font-bold
                                 ${
                                   item.badge === "New"
                                     ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                     : "bg-netflix-600/20 text-netflix-400 border border-netflix-600/30"
                                 }
                               `}
                            >
                              {item.badge}
                            </motion.span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hover shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Section */}
        <motion.div
          className="p-6 border-t border-netflix-dark-800/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {user ? (
            <div className="space-y-4">
              {/* User Profile Card */}
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`
                    flex items-center rounded-2xl transition-all duration-300 group
                    ${isCollapsed ? "justify-center p-3" : "gap-4 p-4"}
                    ${
                      isActive("/profile")
                        ? "bg-gradient-to-r from-netflix-600/20 to-netflix-600/10 shadow-lg shadow-netflix-600/20 border border-netflix-600/20"
                        : "hover:bg-netflix-dark-800/40 border border-transparent hover:border-netflix-dark-700/50"
                    }
                  `}
                >
                  {/* Avatar */}
                  <div className={`relative ${isCollapsed ? "mx-auto" : ""}`}>
                    <div
                      className={`${
                        isCollapsed ? "w-10 h-10" : "w-12 h-12"
                      } rounded-full bg-gradient-to-br from-netflix-600 to-netflix-700 flex-shrink-0 shadow-lg shadow-netflix-600/30`}
                    />
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-netflix-dark-950"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden flex-1"
                      >
                        <p className="text-sm font-semibold text-white truncate">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          View profile
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Logout Button */}
              <motion.button
                onClick={signOut}
                whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center w-full rounded-2xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group border border-transparent hover:border-red-500/20 ${
                  isCollapsed ? "justify-center p-3" : "gap-4 p-4"
                }`}
              >
                <LogOut
                  className={`${
                    isCollapsed ? "w-4 h-4" : "w-5 h-5"
                  } flex-shrink-0 group-hover:scale-110 transition-transform`}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          ) : (
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-netflix-600 to-netflix-700 hover:from-netflix-700 hover:to-netflix-800 text-white transition-all duration-300 shadow-lg shadow-netflix-600/30 group border border-netflix-600/20 ${
                  isCollapsed ? "p-3" : "gap-3 p-4"
                }`}
              >
                <LogIn
                  className={`${
                    isCollapsed ? "w-4 h-4" : "w-5 h-5"
                  } group-hover:scale-110 transition-transform`}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-semibold whitespace-nowrap overflow-hidden"
                    >
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>
          )}
        </motion.div>
      </motion.aside>
    </>
  );
}
