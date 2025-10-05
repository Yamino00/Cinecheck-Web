"use client";

import { useCallback, useState } from "react";

interface RippleEffect {
    x: number;
    y: number;
    size: number;
    id: number;
}

export function useRipple() {
    const [ripples, setRipples] = useState<RippleEffect[]>([]);

    const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        const id = Date.now();

        const newRipple: RippleEffect = { x, y, size, id };

        setRipples((prevRipples) => [...prevRipples, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prevRipples) =>
                prevRipples.filter((ripple) => ripple.id !== id)
            );
        }, 600);
    }, []);

    const clearRipples = useCallback(() => {
        setRipples([]);
    }, []);

    return { ripples, addRipple, clearRipples };
}
