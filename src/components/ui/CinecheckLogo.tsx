import Image from "next/image";
import { motion } from "framer-motion";

interface CinecheckLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const sizeMap = {
  sm: { container: "w-9 h-9", text: "text-lg" },
  md: { container: "w-12 h-12", text: "text-xl" },
  lg: { container: "w-16 h-16", text: "text-2xl" },
  xl: { container: "w-20 h-20", text: "text-3xl" },
};

export default function CinecheckLogo({
  size = "md",
  className = "",
  showText = true,
  animated = true,
}: CinecheckLogoProps) {
  const { container, text } = sizeMap[size];

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      whileHover={animated ? { scale: 1.05 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative ${container} bg-black rounded-lg p-0.5 shadow-lg`}
      >
        <Image
          src="/Cinecheck-logo.png"
          alt="Cinecheck Logo"
          width={
            size === "sm" ? 36 : size === "md" ? 48 : size === "lg" ? 64 : 80
          }
          height={
            size === "sm" ? 36 : size === "md" ? 48 : size === "lg" ? 64 : 80
          }
          className="w-full h-full object-contain"
          priority
        />
        {animated && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-netflix-600/30 to-netflix-700/30 rounded-lg blur-sm opacity-0 group-hover:opacity-80"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold bg-gradient-to-r from-netflix-600 to-netflix-400 bg-clip-text text-transparent ${text}`}
          >
            Cinecheck
          </span>
          <span className="text-xs text-gray-400 -mt-1">Verified Reviews</span>
        </div>
      )}
    </motion.div>
  );
}
