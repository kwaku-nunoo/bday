import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface BookCoverProps {
  onOpen: () => void;
  title: string;
  recipientName: string;
  petName: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  onOpen,
  title,
  recipientName,
  petName
}) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -y * 0.02,
      y: x * 0.02,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative flex items-center justify-center p-4 sm:p-8 perspective-2000 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dimensional Hardcover Book */}
      <div
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.4, 1)'
        }}
        className="group relative w-full max-w-[480px] sm:max-w-[540px] aspect-[1/1.38] rounded-r-2xl rounded-l-md bg-book-cover p-6 sm:p-10 flex flex-col justify-between cursor-pointer shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] border-t border-r border-b border-stone-800/80 transition-shadow hover:shadow-[0_40px_90px_-10px_rgba(0,0,0,0.95)]"
      >
        {/* Realistic Book Spine with Gold Ribbing on Left Edge */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-[#171210] via-[#2F241F] to-[#1E1714] rounded-l-md border-r border-[#3E302A] shadow-inner flex flex-col justify-between py-12 items-center">
          <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.3em] uppercase text-[#C5A059]/60 font-serif-heading">
            Heirloom Edition · {recipientName}
          </span>
          <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />
        </div>

        {/* Stacked Page Thickness on Right Edge */}
        <div className="absolute -right-3 top-2 bottom-2 w-3 bg-gradient-to-r from-[#D9D0C3] via-[#FAF6ED] to-[#ECE3D5] rounded-r-sm shadow-md border-r border-[#C5BBAA] flex flex-col justify-around py-3 opacity-90">
          <div className="w-full h-[1px] bg-stone-300/60" />
          <div className="w-full h-[1px] bg-stone-300/60" />
          <div className="w-full h-[1px] bg-stone-300/60" />
          <div className="w-full h-[1px] bg-stone-300/60" />
        </div>

        {/* Embossed Outer Gold Inset Border */}
        <div className="absolute inset-5 sm:inset-7 border border-[#C5A059]/30 rounded-r-xl pointer-events-none">
          <div className="absolute inset-1.5 border border-[#C5A059]/15 rounded-r-lg" />
          {/* Ornate Corner Accents */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/50" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/50" />
          <div className="absolute bottom-1 left-1 w-3 h-1 border-b-2 border-l-2 border-[#D4AF37]/50" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/50" />
        </div>

        {/* Satin Ribbon Bookmark hanging down */}
        <div className="absolute -top-3 left-28 w-4 h-24 bg-gradient-to-b from-[#8C2818] to-[#5C160B] shadow-md z-20 pointer-events-none rounded-t-sm">
          <div className="absolute -bottom-3 left-0 w-0 h-0 border-l-[8px] border-l-[#5C160B] border-r-[8px] border-r-[#5C160B] border-b-[8px] border-b-transparent" />
        </div>

        {/* Top Header of Cover */}
        <div className="relative pl-6 sm:pl-8 text-center pt-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#C5A059]/80 font-serif-heading">
            A Story of Friendship & Feasts
          </p>
          <div className="w-16 h-[1px] bg-[#C5A059]/30 mx-auto mt-2" />
        </div>

        {/* Main Cover Typography */}
        <div className="relative pl-6 sm:pl-8 text-center my-auto py-6">
          <p className="font-handwriting-script text-2xl sm:text-3xl text-[#E8D4BE] mb-2">
            The Life & Joy of
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif-heading font-medium tracking-tight mb-4 gold-foil-text leading-tight">
            {title}
          </h1>

          {/* Moniker Badge */}
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#18120F]/60 border border-[#C5A059]/35 backdrop-blur-sm shadow-inner mt-2">
            <p className="font-handwriting-script text-lg sm:text-xl text-[#F4E5BD]">
              “The Hammer Headed Foodian”
            </p>
          </div>

          <p className="text-xs sm:text-sm font-literary-body text-stone-400 italic mt-6 max-w-xs mx-auto leading-relaxed">
            Bound with cherished memories, golden hours, and boundless gratitude.
          </p>
        </div>

        {/* Bottom Interactive Invitation */}
        <div className="relative pl-6 sm:pl-8 pb-2 flex flex-col items-center">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#382C24]/80 text-[#F5EFE6] border border-[#C5A059]/40 group-hover:border-[#D4AF37] group-hover:bg-[#45362C] transition-all duration-300 shadow-md">
            <span className="font-serif-heading text-xs uppercase tracking-widest text-[#F0E6D2]">
              Turn To First Page
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-[10px] text-stone-500 font-literary-body mt-3">
            Click or tap book cover to open
          </span>
        </div>
      </div>
    </div>
  );
};
