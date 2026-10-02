import React, { useState, useRef } from 'react';
import { Sparkles, MapPin, Calendar, RefreshCw, ArrowRight } from 'lucide-react';
import { PolaroidMemory } from '../types/story';
import { DisintegrationCanvas } from './DisintegrationCanvas';
import { StoryPage } from './StoryPage';

interface PagePolaroidScrapbookProps {
  polaroids: PolaroidMemory[];
  onAdvanceToNextChapter: () => void;
}

export const PagePolaroidScrapbook: React.FC<PagePolaroidScrapbookProps> = ({
  polaroids,
  onAdvanceToNextChapter
}) => {
  const [activePolaroidId, setActivePolaroidId] = useState<string | null>(null);
  const [disintegratedIds, setDisintegratedIds] = useState<Set<string>>(new Set());
  const [disintegratingState, setDisintegratingState] = useState<{
    imageSrc: string;
    rect: DOMRect | null;
  } | null>(null);

  const photoRefMap = useRef<Record<string, HTMLDivElement | null>>({});
  const activeModalRef = useRef<HTMLDivElement | null>(null);

  const activePolaroid = polaroids.find((p) => p.id === activePolaroidId);
  const allDisintegrated = polaroids.length > 0 && disintegratedIds.size === polaroids.length;

  const handlePolaroidClick = (id: string) => {
    if (disintegratedIds.has(id)) return;
    setActivePolaroidId(id);
  };

  const handleEnlargedClick = () => {
    if (!activePolaroid) return;
    const rect = activeModalRef.current?.getBoundingClientRect() || null;
    const targetSrc = activePolaroid.imageSrc;
    const targetId = activePolaroid.id;

    // Transition immediately to disintegrating state
    setActivePolaroidId(null);
    setDisintegratingState({
      imageSrc: targetSrc,
      rect,
    });

    // Mark as disintegrated
    setDisintegratedIds((prev) => new Set(prev).add(targetId));
  };

  const handleDisintegrationComplete = () => {
    setDisintegratingState(null);
  };

  const handleRestoreMemories = () => {
    setDisintegratedIds(new Set());
    setActivePolaroidId(null);
  };

  return (
    <StoryPage>
      <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between">
        {/* Scrapbook Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3D8C8] gap-2 z-10">
          <div>
            <div className="flex items-center gap-2 text-[#C5A059]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-[0.2em] font-serif-heading font-semibold text-[#8C6D58]">
                Chapter II · The Scrapbook Table
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium text-[#2C211B]">
              Moments Suspended in Time
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8C7A6B] font-literary-body italic">
              {disintegratedIds.size === 0
                ? 'Click a photo to lift and inspect it'
                : `${disintegratedIds.size} of ${polaroids.length} dissolved into memories`}
            </span>

            {disintegratedIds.size > 0 && (
              <button
                onClick={handleRestoreMemories}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE2D3] hover:bg-[#DFD4C2] text-[#4A3B32] text-xs font-serif-heading border border-[#C5B7A2] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-[#C5A059]" />
                <span>Reset Photos</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrapbook Surface with Scattered Polaroids */}
        <div className="relative my-auto py-6 sm:py-10 min-h-[380px] flex items-center justify-center">
          {/* Faded Antique Tabletop Guidelines */}
          <div className="absolute inset-0 border border-dashed border-[#D9CDBC]/50 rounded-lg pointer-events-none" />

          {/* Scattered Polaroids */}
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-center justify-items-center">
            {polaroids.map((polaroid) => {
              const isDisintegrated = disintegratedIds.has(polaroid.id);

              if (isDisintegrated) {
                return (
                  <div
                    key={polaroid.id}
                    className="w-56 sm:w-64 aspect-[1/1.22] rounded-xs border-2 border-dashed border-[#D4C8B5]/60 flex flex-col items-center justify-center p-4 text-center bg-[#F1ECE0]/30"
                  >
                    <Sparkles className="w-5 h-5 text-[#C5A059]/40 mb-2 animate-pulse" />
                    <p className="font-handwriting-script text-lg text-[#9E8E80]">
                      “{polaroid.title}”
                    </p>
                    <p className="text-[10px] text-[#B0A294] font-literary-body mt-1 italic">
                      Dissolved into stardust
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={polaroid.id}
                  ref={(el) => {
                    photoRefMap.current[polaroid.id] = el;
                  }}
                  onClick={() => handlePolaroidClick(polaroid.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePolaroidClick(polaroid.id);
                    }
                  }}
                  style={{
                    transform: `rotate(${polaroid.rotation}deg)`,
                    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.3s ease',
                  }}
                  className="group relative w-56 sm:w-64 p-3.5 pb-5 bg-[#FAF7F0] rounded-xs shadow-[0_10px_25px_rgba(44,35,30,0.18)] hover:shadow-[0_20px_40px_rgba(44,35,30,0.32)] hover:scale-105 border border-[#DCD1BF] cursor-pointer z-10 hover:z-20 transition-all"
                >
                  {/* Washi Tape Strip */}
                  <div
                    style={{ transform: `rotate(${polaroid.tapeAngle}deg)` }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 washi-tape pointer-events-none z-10"
                  />

                  {/* Photo Square */}
                  <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs mb-3 shadow-inner">
                    <img
                      src={polaroid.imageSrc}
                      alt={polaroid.title}
                      className="w-full h-full object-cover filter contrast-[1.03] group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>

                  {/* Polaroid Handwritten Caption */}
                  <div className="px-1 text-center">
                    <h3 className="font-handwriting-script text-xl text-[#3A2C23] group-hover:text-[#B35C52] transition-colors leading-tight">
                      {polaroid.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-[#8C7A6B] font-literary-body">
                      <span>{polaroid.location}</span>
                      <span>·</span>
                      <span>{polaroid.date}</span>
                    </div>
                  </div>

                  {/* Hint badge */}
                  <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-[#A69788] italic font-literary-body">
                    Tap to lift
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion state after all photos disintegrated */}
        {allDisintegrated && (
          <div className="my-2 p-4 rounded-lg bg-[#EFE9DD]/85 border border-[#D5C7B2] text-center max-w-lg mx-auto z-10 shadow-sm animate-fade-in">
            <p className="font-handwriting-script text-2xl text-[#2C211B] mb-1">
              “The photographs have scattered into light, but the moments live with us forever.”
            </p>
            <p className="text-xs text-[#7A6B5E] font-literary-body mb-3">
              Every feast, every fit of laughter, and every quiet sunset.
            </p>
            <button
              onClick={onAdvanceToNextChapter}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2C231E] to-[#45362C] text-[#F5EFE6] border border-[#C5A059]/60 hover:border-[#D4AF37] shadow-md hover:scale-105 transition-all text-xs font-serif-heading uppercase tracking-wider cursor-pointer"
            >
              <span>Proceed to Chapter III</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </button>
          </div>
        )}

        {/* Scrapbook Bottom Navigation Note */}
        <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-serif-heading border-t border-[#E3D8C8] pt-2 z-10">
          <span>Curated Keepsake Spread</span>
          <span>Page 04 — Memories</span>
        </div>
      </div>

      {/* STAGE 1 & 2: Enlarged Polaroid Focus Modal */}
      {activePolaroid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={handleEnlargedClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActivePolaroidId(null);
            if (e.key === 'Enter' || e.key === ' ') handleEnlargedClick();
          }}
        >
          <div
            ref={activeModalRef}
            onClick={(e) => {
              e.stopPropagation();
              handleEnlargedClick();
            }}
            className="group relative max-w-sm sm:max-w-md w-full p-4 sm:p-5 pb-8 bg-[#FAF7F0] rounded-xs shadow-[0_25px_60px_rgba(0,0,0,0.65)] border border-[#E3D8C8] cursor-pointer transform hover:scale-[1.01] transition-transform select-none"
          >
            {/* Vintage Polaroid Tape on Top */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape rotate-1 shadow-sm z-20" />

            {/* Photo Preview Container */}
            <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs mb-4 shadow-md">
              <img
                src={activePolaroid.imageSrc}
                alt={activePolaroid.title}
                className="w-full h-full object-cover filter contrast-[1.04]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Handwritten Title & Memory Story */}
            <div className="text-center px-2">
              <h3 className="font-handwriting-script text-2xl sm:text-3xl text-[#2C211B] mb-1">
                {activePolaroid.title}
              </h3>
              <p className="font-literary-body text-sm text-[#4A3B32] italic leading-relaxed my-2">
                “{activePolaroid.caption}”
              </p>

              <div className="flex items-center justify-center gap-4 text-xs text-[#8C7A6B] font-literary-body pt-2 border-t border-[#EAE1D3] mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C5A059]" />
                  {activePolaroid.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C5A059]" />
                  {activePolaroid.date}
                </span>
              </div>
            </div>

            {/* Disintegration Hint */}
            <div className="mt-4 pt-3 border-t border-dashed border-[#DFD5C4] text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE2D3] text-[#7A6B5E] text-[11px] font-serif-heading uppercase tracking-wider group-hover:bg-[#DFD4C2] transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-spin [animation-duration:3s]" />
                Click again to disintegrate into stardust
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: Canvas Disintegration Physics */}
      {disintegratingState && (
        <DisintegrationCanvas
          imageSrc={disintegratingState.imageSrc}
          sourceRect={disintegratingState.rect}
          onComplete={handleDisintegrationComplete}
        />
      )}
    </StoryPage>
  );
};
