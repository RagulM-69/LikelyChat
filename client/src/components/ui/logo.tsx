import React from 'react';

export const ShoshinshaMark = ({ className = "w-10 h-10" }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 130"
            className={className}
        >
            <path d="M50 0 L100 25 L100 130 L50 105 Z" fill="#4ade80" /> {/* Green Right Side */}
            <path d="M0 25 L50 0 L50 105 L0 130 Z" fill="#facc15" /> {/* Yellow Left Side */}
        </svg>
    );
};
