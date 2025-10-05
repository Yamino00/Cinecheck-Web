"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

export default function AnimatedTabs({
  tabs,
  defaultTab,
  onTabChange,
  children,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-netflix-dark-800">
        <nav className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  relative px-6 py-4 text-sm md:text-base font-medium whitespace-nowrap
                  transition-colors duration-200
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }
                `}
              >
                {/* Content */}
                <div className="flex items-center gap-2">
                  {tab.icon && <span className="text-lg">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        isActive
                          ? "bg-netflix-600 text-white"
                          : "bg-netflix-dark-800 text-gray-400"
                      }
                    `}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>

                {/* Active Underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-netflix-600"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Hover Effect */}
                {!isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="py-6"
      >
        {children(activeTab)}
      </motion.div>
    </div>
  );
}
