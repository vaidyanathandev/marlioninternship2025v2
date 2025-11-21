import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  glass = false,
  hover = false,
}) => {
  const baseStyles = "rounded-2xl p-6";
  const glassStyles = glass
    ? "glass-card"
    : "bg-marlion-surface border border-marlion-border";
  const hoverStyles = hover
    ? "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
    : "";

  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
