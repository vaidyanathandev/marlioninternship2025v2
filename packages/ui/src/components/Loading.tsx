import React from "react";

export const Loading: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-marlion-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-marlion-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-marlion-muted text-sm">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-marlion-bg flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
