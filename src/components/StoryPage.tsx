import React, { ReactNode } from 'react';

interface StoryPageProps {
  children: ReactNode;
  folioLeft?: string;
  plateLeft?: string;
  folioRight?: string;
  pageRight?: string;
  className?: string;
  showSpineDivider?: boolean;
}

/**
 * StoryPage Layout Engine
 * Provides authentic vintage scrapbook spreads with central leather book spine depth
 * and warm archival parchment texture.
 */
export const StoryPage: React.FC<StoryPageProps> = ({
  children,
  className = '',
  showSpineDivider = true
}) => {
  return (
    <article 
      aria-label="Storybook page"
      className={`relative w-full h-full min-h-[560px] sm:min-h-[640px] bg-parchment rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden border border-[#D5C7B2]/75 deckle-edge select-none ${className}`}
    >
      {/* Central Book Spine Shadow Divider */}
      {showSpineDivider && (
        <div 
          aria-hidden="true"
          className="hidden md:block absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="w-1/2 h-full page-spine-shadow-right absolute left-0" />
          <div className="w-1/2 h-full page-spine-shadow-left absolute right-0" />
          <div className="w-[1.5px] h-full bg-[#3E302A]/20 absolute left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Page Content Spreads */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </article>
  );
};
