"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function InteractiveBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 700 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#030014] pointer-events-none">
            {/* Dynamic Gradient Orb following mouse */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-50 will-change-transform"
            />

            {/* Static Ambient Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 animate-pulse duration-10000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 animate-pulse duration-7000" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Stars */}
            <ClientStars />
        </div>
    );
}

function ClientStars() {
    const [stars, setStars] = useState<any[]>([]);

    useEffect(() => {
        const generatedStars = [...Array(20)].map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            duration: Math.random() * 10 + 10,
            yOffset: Math.random() * -100,
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
        }));
        setStars(generatedStars);
    }, []);

    if (stars.length === 0) return null;

    return (
        <div className="absolute inset-0">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full"
                    initial={{
                        x: star.x,
                        y: star.y,
                        scale: star.scale,
                        opacity: star.opacity
                    }}
                    animate={{
                        y: [null, star.yOffset],
                        opacity: [null, 0]
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        width: star.width,
                        height: star.height,
                    }}
                />
            ))}
        </div>
    );
}

