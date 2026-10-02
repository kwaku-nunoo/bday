import React from 'react';
import { Heart, UtensilsCrossed } from 'lucide-react';
import { StoryPage } from './StoryPage';

interface PageFriendTributeProps {
  author: string;
  relationship: string;
  headline: string;
  paragraphs: string[];
  imageSrc: string;
  photoCaption: string;
}

export const PageFriendTribute: React.FC<PageFriendTributeProps> = ({
  author,
  relationship,
  headline,
  paragraphs,
  imageSrc,
  photoCaption
}) => {
  return (
    <StoryPage>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full min-h-[560px] sm:min-h-[640px]">
        {/* LEFT PAGE: Photo of Caroline & Friend */}
        <div className="p-6 sm:p-10 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-[#D9CEBC]/60">
          {/* Folio */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-2">
            <span>Surprise Interlude</span>
            <span>Plate 02</span>
          </div>

          {/* Candid Shared Memory Photo */}
          <div className="my-auto py-4 flex flex-col items-center">
            <div className="relative p-3 bg-[#FAF7F0] shadow-xl rounded-sm border border-[#D8CEBC] transform rotate-1 hover:rotate-0 transition-transform duration-300 max-w-sm w-full">
              {/* Washi Tape Strip */}
              <div className="absolute -top-3 right-6 w-20 h-5 washi-tape -rotate-3 z-20 pointer-events-none" />

              <div className="relative aspect-[4/3] overflow-hidden rounded-xs bg-stone-200">
                <img
                  src={imageSrc}
                  alt="Caroline and friend sharing a cherished meal together"
                  className="w-full h-full object-cover filter contrast-[1.04] sepia-[0.06]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Handwritten Caption */}
              <div className="pt-3 pb-1 text-center">
                <p className="font-handwriting-script text-xl sm:text-2xl text-[#3E2E25] leading-snug">
                  “{photoCaption}”
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A29182] uppercase tracking-wider font-serif-heading mt-1">
                  <UtensilsCrossed className="w-3 h-3 text-[#C5A059]" />
                  <span>Partner in Feasts & Secrets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vintage Stamp Accent */}
          <div className="flex items-center justify-between text-xs text-[#9E8E80] font-literary-body italic">
            <span>Certified Food Adventures</span>
            <span className="text-[#C5A059] font-serif-heading text-[10px] tracking-widest uppercase">
              Special Dedication
            </span>
          </div>
        </div>

        {/* RIGHT PAGE: Heartfelt Note from Friend */}
        <div className="p-6 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-[#FAF7F0] to-[#F3EFE6]">
          {/* Folio */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-2">
            <span>Friendship Tribute</span>
            <span>Page 03</span>
          </div>

          {/* Tribute Letter */}
          <div className="my-auto py-4">
            <div className="flex items-center gap-2 text-[#B35C52] mb-2">
              <Heart className="w-4 h-4 fill-current text-[#B35C52]" />
              <span className="text-xs uppercase tracking-[0.2em] font-serif-heading font-semibold text-[#8C2818]">
                A Surprise Message
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium text-[#2C211B] mb-4 tracking-tight">
              {headline}
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm font-literary-body text-[#473932] leading-relaxed">
              {paragraphs.map((para, i) => (
                <p key={i} className={i === 0 ? "font-serif-heading italic text-[#7C2D12] text-sm sm:text-base font-normal mb-1" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* Author Signature & Wax Stamp */}
            <div className="mt-6 pt-4 border-t border-[#E8DDCD] flex items-center justify-between">
              <div>
                <p className="font-handwriting-script text-2xl sm:text-3xl text-[#2C211B]">
                  {author}
                </p>
                <p className="text-[11px] text-[#8C7B6E] font-serif-heading tracking-wider uppercase mt-0.5">
                  {relationship}
                </p>
              </div>

              {/* Subtle Wax Seal Motif */}
              <div className="w-10 h-10 rounded-full bg-[#8C2818]/90 text-[#F9E8B2] flex items-center justify-center font-display-classic text-sm font-bold shadow-md border border-[#D4AF37]/50">
                ❤
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#A69788] font-literary-body italic">
            Next: The Polaroid Memory Table
          </div>
        </div>
      </div>
    </StoryPage>
  );
};
