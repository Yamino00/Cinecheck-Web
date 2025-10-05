"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DrawerMenu from "../ui/DrawerMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Don't show layout on auth pages
  if (pathname?.startsWith("/auth")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-cinema-dark-bg">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`
        flex-1 flex flex-col min-h-screen
        lg:ml-${sidebarCollapsed ? "20" : "64"}
        transition-all duration-300
      `}
      >
        {/* Mobile TopBar */}
        <TopBar onMenuClick={() => setMobileDrawerOpen(true)} />

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Drawer */}
      <DrawerMenu
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </div>
  );
}
