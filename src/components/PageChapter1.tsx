import React from 'react';
import { Sparkles } from 'lucide-react';
import { StoryPage } from './StoryPage';

interface PageChapter1Props {
  portraitSrc: string;
  recipientName: string;
  petName: string;
  headline: string;
  paragraphs: string[];
}

export const PageChapter1: React.FC<PageChapter1Props> = ({
  portraitSrc,
  recipientName,
  petName,
  headline,
  paragraphs
}) => {
  return (
    <StoryPage>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full min-h-[560px] sm:min-h-[640px]">
        {/* LEFT PAGE: Archival Portrait */}
        <div className="p-6 sm:p-10 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-[#D9CEBC]/60">
          {/* Page Folio & Number */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-2">
            <span>Memoir Vol. I</span>
            <span>Plate 01</span>
          </div>

          {/* Featured Archival Portrait Container */}
          <div className="my-auto py-4 flex flex-col items-center">
            <div className="relative p-2.5 sm:p-3 bg-[#FAF7F0] shadow-xl rounded-sm border border-[#D8CEBC] transform -rotate-1 hover:rotate-0 transition-transform duration-300 max-w-sm w-full">
              {/* Washi Tape Accent */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape rotate-1 z-20 pointer-events-none" />

              <div className="relative aspect-[3/4] overflow-hidden rounded-xs bg-stone-200">
                <img
                  src={portraitSrc}
                  alt={`Archival portrait of ${recipientName}`}
                  className="w-full h-full object-cover filter contrast-[1.03] sepia-[0.08]"
                  referrerPolicy="no-referrer"
                />
                {/* Subtle Film Grain Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Handwritten Photo Caption */}
              <div className="pt-3 pb-1 text-center">
                <p className="font-handwriting-script text-xl sm:text-2xl text-[#4A3B32] leading-snug">
                  Caroline in her element — laughter in the air & treats on the table.
                </p>
                <p className="text-[10px] text-[#9E8E80] uppercase tracking-wider font-serif-heading mt-0.5">
                  The Incomparable {petName}
                </p>
              </div>
            </div>
          </div>

          {/* Botanical Pressed Leaf Footnote */}
          <div className="flex items-center gap-2 text-[#8C7A6B] text-xs font-literary-body italic">
            <span className="w-8 h-[1px] bg-[#C5A059]/50" />
            <span>A smile that lights up every room</span>
          </div>
        </div>

        {/* RIGHT PAGE: The Personal Letter */}
        <div className="p-6 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-[#FAF7F0] to-[#F3EFE6]">
          {/* Folio */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-2">
            <span>The Friendship Spread</span>
            <span>Page 02</span>
          </div>

          {/* Letter Prose */}
          <div className="my-auto py-4">
            <div className="flex items-center gap-2 text-[#C5A059] mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-serif-heading font-semibold">
                Chapter I · The Joy of Us
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif-heading font-medium text-[#2C211B] mb-5 tracking-tight">
              {headline}
            </h2>

            <div className="space-y-4 text-sm sm:text-base font-literary-body text-[#473932] leading-relaxed">
              {paragraphs.map((para, i) => (
                <p key={i} className={i === 0 ? "first-letter:text-4xl first-letter:font-serif-heading first-letter:text-[#C5A059] first-letter:mr-2.5 first-letter:float-left first-letter:leading-none" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* Ink Signature */}
            <div className="mt-8 pt-4 border-t border-[#E8DDCD] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="font-handwriting-script text-2xl sm:text-3xl text-[#2C211B]">
                  With all our love & hearty cheers,
                </p>
                <p className="text-xs text-[#8C7B6E] font-serif-heading tracking-wide uppercase mt-1">
                  Your Everlasting Fan Club
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-[#EFE9DD] border border-[#D8CEBC] text-[11px] font-serif-heading text-[#7A6B5E] tracking-wider">
                  Est. Friendship
                </span>
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#A69788] font-literary-body italic">
            Turn page for the surprise friend tribute
          </div>
        </div>
      </div>
    </StoryPage>
  );
};
