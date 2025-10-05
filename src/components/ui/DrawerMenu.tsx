"use client";

import { Drawer } from "vaul";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Search,
  Film,
  Tv,
  Star,
  User,
  Trophy,
  LogOut,
  LogIn,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

interface DrawerMenuProps {
  open: boolean;
  onClose?: () => void;
}

export default function DrawerMenu({ open, onClose }: DrawerMenuProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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

  const handleLinkClick = () => {
    onClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  return (
    <Drawer.Root open={open} onClose={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Drawer.Content className="fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 bg-netflix-dark-950 border-r border-netflix-dark-800 flex flex-col outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-netflix-dark-800">
            <Link
              href="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-netflix-600 flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-netflix-600">
                Cinecheck
              </span>
            </Link>
            <button
              onClick={() => onClose?.()}
              className="p-2 rounded-lg hover:bg-netflix-dark-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
            {navigationItems.map((item) => {
              if (item.requireAuth && !user) return null;

              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                >
                  <motion.div
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
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-netflix-600 rounded-r-full" />
                    )}
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth */}
          <div className="border-t border-netflix-dark-800 p-4">
            {user ? (
              <div className="space-y-3">
                <Link href="/profile" onClick={handleLinkClick}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-netflix-dark-800 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-netflix-600" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500">View profile</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/auth" onClick={handleLinkClick}>
                <button className="flex items-center justify-center gap-3 w-full p-3 rounded-lg bg-netflix-600 hover:bg-netflix-700 text-white transition-colors">
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </button>
              </Link>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
