import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-marlion-text mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-marlion-muted">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 ${icon ? "pl-10" : ""}
            bg-marlion-surface border border-marlion-border
            rounded-xl text-marlion-text
            focus:outline-none focus:ring-2 focus:ring-marlion-primary focus:border-transparent
            transition-all duration-300
            placeholder-marlion-muted
            ${error ? "border-marlion-danger focus:ring-marlion-danger" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-marlion-danger">{error}</p>}
    </div>
  );
};
