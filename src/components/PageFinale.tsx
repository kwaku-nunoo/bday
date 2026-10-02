import React from 'react';
import { Sparkles, BookCopy } from 'lucide-react';
import { StoryPage } from './StoryPage';

interface PageFinaleProps {
  onCloseBook: () => void;
  closingNote: string;
  recipientName: string;
}

export const PageFinale: React.FC<PageFinaleProps> = ({
  onCloseBook,
  closingNote,
  recipientName
}) => {
  return (
    <StoryPage showSpineDivider={false}>
      <div className="w-full h-full min-h-[560px] sm:min-h-[640px] p-8 sm:p-14 flex flex-col items-center justify-between text-center relative select-none">
        {/* Subtle Archival Watermark Border */}
        <div className="absolute inset-5 sm:inset-8 border border-[#D9CDBC]/50 rounded-lg pointer-events-none" />

        {/* Top Foil Flourish */}
        <div className="pt-4 z-10">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#8C6D58] font-serif-heading">
            The Final Frame
          </span>
        </div>

        {/* Main Center Dramatic "THE END" */}
        <div className="my-auto py-8 z-10 max-w-md mx-auto flex flex-col items-center">
          <Sparkles className="w-6 h-6 text-[#C5A059] mb-4 animate-pulse [animation-duration:2.5s]" />

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif-heading font-medium tracking-tight mb-4 gold-foil-text drop-shadow-sm">
            THE END
          </h1>

          <p className="font-handwriting-script text-2xl sm:text-3xl text-[#5A453A] mb-6 leading-snug">
            “{closingNote}”
          </p>

          <div className="w-24 h-[1px] bg-[#C5A059]/40 mb-6" />

          <p className="text-xs sm:text-sm font-literary-body text-[#7A6B5E] italic leading-relaxed max-w-xs">
            Happy Birthday, {recipientName}. May every tomorrow bring a reason to smile, feast, and rejoice.
          </p>
        </div>

        {/* Book Closing Action */}
        <div className="pb-4 z-10 flex flex-col items-center">
          <button
            onClick={onCloseBook}
            type="button"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#2C231E] hover:bg-[#3D312A] text-[#F5EFE6] border border-[#C5A059]/50 hover:border-[#D4AF37] shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs font-serif-heading uppercase tracking-widest"
          >
            <BookCopy className="w-4 h-4 text-[#C5A059] transition-transform group-hover:-rotate-6" />
            <span>Close & Keep Book</span>
          </button>
          <span className="text-[10px] text-stone-400 font-literary-body mt-2.5">
            You can reopen and read through anytime
          </span>
        </div>
      </div>
    </StoryPage>
  );
};
