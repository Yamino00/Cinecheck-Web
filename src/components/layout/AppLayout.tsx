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
    <>
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`
        bg-cinema-dark-bg
        ${sidebarCollapsed ? "lg:ml-24" : "lg:ml-88"}
        transition-all duration-400 ease-out
      `}
      >
        {/* Mobile TopBar */}
        <TopBar onMenuClick={() => setMobileDrawerOpen(true)} />

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Mobile Drawer */}
      <DrawerMenu
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </>
  );
}
