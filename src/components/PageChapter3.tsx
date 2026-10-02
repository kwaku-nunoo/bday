import React from 'react';
import { Sparkles, Wine, Compass, Sun, Heart } from 'lucide-react';
import { StoryPage } from './StoryPage';

interface PageChapter3Props {
  headline: string;
  wishes: string[];
  finalQuote: string;
}

export const PageChapter3: React.FC<PageChapter3Props> = ({
  headline,
  wishes,
  finalQuote
}) => {
  const wishIcons = [
    <Compass key="1" className="w-4 h-4 text-[#C5A059]" />,
    <Wine key="2" className="w-4 h-4 text-[#C5A059]" />,
    <Sun key="3" className="w-4 h-4 text-[#C5A059]" />,
    <Heart key="4" className="w-4 h-4 text-[#C5A059]" />
  ];

  return (
    <StoryPage>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full min-h-[560px] sm:min-h-[640px]">
        {/* LEFT PAGE: The Birthday Blessings */}
        <div className="p-6 sm:p-10 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-[#D9CEBC]/60">
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-2">
            <span>Future Horizons</span>
            <span>Page 05</span>
          </div>

          <div className="my-auto py-4">
            <div className="flex items-center gap-2 text-[#C5A059] mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-serif-heading font-semibold text-[#8C6D58]">
                Chapter III · The Horizon
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium text-[#2C211B] mb-5 tracking-tight">
              {headline}
            </h2>

            <div className="space-y-4">
              {wishes.map((wish, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 p-1.5 rounded-full bg-[#EAE2D3] border border-[#D5C7B2]">
                    {wishIcons[index % wishIcons.length]}
                  </span>
                  <p className="text-sm font-literary-body text-[#473932] leading-relaxed">
                    {wish}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#8C7A6B] font-literary-body italic flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#C5A059]/40" />
            <span>To endless new tomorrows & feasts</span>
          </div>
        </div>

        {/* RIGHT PAGE: The Toast & Closing Reflections */}
        <div className="p-6 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-[#FAF7F0] to-[#F3EFE6]">
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-2">
            <span>The Birthday Toast</span>
            <span>Page 06</span>
          </div>

          <div className="my-auto py-8 text-center flex flex-col items-center">
            {/* Decorative Gold Leaf Emblem */}
            <div className="w-14 h-14 rounded-full bg-[#EAE1D2] border border-[#C5A059]/40 flex items-center justify-center mb-6 shadow-sm">
              <Wine className="w-6 h-6 text-[#C5A059]" />
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-[#8C6D58] font-serif-heading mb-3">
              A Glass Raised in Your Honor
            </p>

            <h3 className="font-handwriting-script text-3xl sm:text-4xl text-[#2C211B] mb-6 leading-snug max-w-sm">
              “Here's to Caroline — the heart of the feast, the spark of the room, and the truest friend.”
            </h3>

            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent my-4" />

            {/* Inspirational Quote */}
            <div className="p-4 sm:p-6 rounded-lg bg-[#FAF6EE] border border-[#E0D5C3] shadow-sm max-w-sm">
              <p className="font-serif-heading italic text-base sm:text-lg text-[#3E3028] leading-relaxed">
                {finalQuote}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#A69788] font-literary-body italic">
            Turn page for the Finale
          </div>
        </div>
      </div>
    </StoryPage>
  );
};
