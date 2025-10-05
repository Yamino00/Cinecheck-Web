"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface UseMagneticHoverProps {
    strength?: number;
    springConfig?: {
        damping?: number;
        stiffness?: number;
        mass?: number;
    };
}

export function useMagneticHover({
    strength = 0.3,
    springConfig = { damping: 15, stiffness: 150, mass: 0.1 },
}: UseMagneticHoverProps = {}) {
    const ref = useRef<HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        const handleMouseMove = (e: MouseEvent) => {
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            x.set(deltaX);
            y.set(deltaY);
        };

        const handleMouseEnter = () => {
            setIsHovered(true);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            x.set(0);
            y.set(0);
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength, x, y]);

    return {
        ref,
        style: {
            x: springX,
            y: springY,
        },
        isHovered,
    };
}
