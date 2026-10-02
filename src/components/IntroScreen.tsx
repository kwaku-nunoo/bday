import React from 'react';
import { Sparkles, Music2, BookOpen } from 'lucide-react';
import { globalAudioEngine } from '../services/AudioEngine';

interface IntroScreenProps {
  onBegin: () => void;
  recipientName: string;
  petName: string;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onBegin,
  recipientName,
  petName
}) => {
  const handleStart = async () => {
    // Unlock Web Audio immediately on user interaction
    await globalAudioEngine.start();
    onBegin();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#161210] overflow-hidden select-none">
      {/* Ambient Lighting Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(197,160,89,0.18)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B35C52]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#4A5D4E]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Dust Particles */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <main className="relative z-20 max-w-xl w-full text-center flex flex-col items-center">
        {/* Wax Seal Emblem */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8C2D19] via-[#6B1F10] to-[#4A140A] shadow-2xl flex items-center justify-center border-2 border-[#D4AF37]/50 mb-8 relative group">
          <div className="absolute inset-1 rounded-full border border-[#FFDF73]/30" />
          <span className="font-display-classic text-2xl text-[#F9E8B2] font-semibold tracking-tighter">
            {recipientName.charAt(0)}
          </span>
          <div className="absolute -inset-1 rounded-full bg-[#C5A059]/20 blur-sm pointer-events-none" />
        </div>

        {/* Dedication Kicker */}
        <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-serif-heading mb-3">
          A Keepsake Created Specially For You
        </p>

        {/* Recipient Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif-heading font-medium text-[#F6F1EA] tracking-tight mb-4 drop-shadow-md">
          Happy Birthday, <span className="italic gold-foil-text">{recipientName}</span>
        </h1>

        {/* Moniker Subtitle */}
        <p className="font-david-mergens text-3xl sm:text-4xl text-[#E8D4BE] mb-8 leading-snug max-w-md">
          “To our legendary {petName} — may your day be as extraordinary as your appetite for joy.”
        </p>

        {/* Hairline Divider */}
        <div className="flex items-center justify-center gap-3 w-48 mb-10" aria-hidden="true">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />
        </div>

        {/* Action Button */}
        <button
          onClick={handleStart}
          type="button"
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#2C231E] via-[#3D312A] to-[#2C231E] text-[#F7F2EC] border border-[#C5A059]/60 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:border-[#D4AF37] hover:shadow-[0_12px_36px_rgba(197,160,89,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-[#C5A059] transition-transform group-hover:rotate-6" />
          <span className="font-serif-heading text-base tracking-wide font-medium">
            Open Your Birthday Story
          </span>
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-600/60 text-xs text-[#C5A059]">
            <Music2 className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[11px] font-literary-body italic text-stone-300 hidden sm:inline">
              soundtrack included
            </span>
          </div>
        </button>

        <p className="text-[11px] text-stone-400 mt-6 tracking-wide font-literary-body">
          Turn your sound on for the full cinematic experience
        </p>
      </main>
    </div>
  );
};
