import React, { useState, useEffect } from 'react';
import { StoryData } from '../types/story';
import { StPageFlipBook } from './StPageFlipBook';
import { AtmosphericBalloons } from './AtmosphericBalloons';
import { globalAudioEngine } from '../services/AudioEngine';
import { Sparkles } from 'lucide-react';
import introVideo from '../assets/images/intro .mp4';

interface TheatricalCurtainStageProps {
  story: StoryData;
}

type StagePhase = 'closed' | 'parting' | 'intro' | 'zooming' | 'reading';

export const TheatricalCurtainStage: React.FC<TheatricalCurtainStageProps> = ({ story }) => {
  const [phase, setPhase] = useState<StagePhase>('closed');

  const handleCurtainTap = async () => {
    if (phase !== 'closed') return;

    // Start background soundtrack & audio context on first interaction
    try {
      await globalAudioEngine.start();
      globalAudioEngine.playPageTurnSound();
    } catch {
      // Audio autoplay handled gracefully
    }

    // Step 1: Curtains part ways smoothly
    setPhase('parting');

    // Let the curtain animation finish before playing the intro.
    setTimeout(() => {
      setPhase('intro');
    }, 1400);
  };

  const handleIntroEnded = () => {
    setPhase('zooming');
    setTimeout(() => setPhase('reading'), 1800);
  };

  // Keyboard shortcut to unveil
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (phase === 'closed') {
          handleCurtainTap();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const isCurtainOpen = phase !== 'closed';
  const isZoomed = phase === 'zooming' || phase === 'reading';
  const isBookVisible = phase === 'zooming' || phase === 'reading';

  return (
    <div className="relative min-h-screen w-full bg-[#0C0806] text-[#E8D4BE] overflow-hidden select-none flex flex-col justify-between">
      {/* Deep Theatrical Stage Background */}
      <div className="fixed inset-0 pointer-events-none theater-stage-glow z-0" />
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:32px_32px] z-0" 
        aria-hidden="true" 
      />

      {/* Atmospheric Stage Floor Plank Horizon */}
      <div className="fixed bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black via-[#160E0B]/70 to-transparent pointer-events-none z-0" />

      {/* Plentiful Colorful Floating Balloons Streaming Continuously */}
      <AtmosphericBalloons />

      {/* Top Header (Empty) */}
      <header className="relative z-30 w-full max-w-4xl mx-auto" />

      {/* Center Stage: The Book on its Stand with Cinematic Dolly Zoom */}
      <main className="relative z-10 w-full my-auto flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Theatrical Overhead Spotlight Beam */}
        <div 
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[420px] sm:w-[650px] h-[700px] pointer-events-none transition-opacity duration-1000 ${
            isCurtainOpen ? 'opacity-100' : 'opacity-40'
          }`}
          style={{
            background: 'radial-gradient(ellipse at 50% 15%, rgba(255, 230, 170, 0.22) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 70%)',
          }}
        />

        {/* Dynamic Zooming Container: Starts in distance on stand, then smoothly zooms to reader */}
        <div
          style={{
            transform: isZoomed ? 'scale(1) translateY(0)' : 'scale(0.66) translateY(45px)',
            transition: 'transform 1.8s cubic-bezier(0.25, 1, 0.35, 1)',
          }}
          className="relative will-change-transform flex flex-col items-center justify-center w-full max-w-full"
        >
          {/* Antique Wooden & Brass Lectern Podium Stand (Visible during distant stand view) */}
          <div
            style={{
              opacity: isZoomed ? 0 : 1,
              transform: isZoomed ? 'translateY(60px)' : 'translateY(0)',
              transition: 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
              pointerEvents: isZoomed ? 'none' : 'auto',
            }}
            className="absolute -bottom-16 sm:-bottom-20 w-[90vw] max-w-[560px] flex flex-col items-center z-0"
          >
            {/* Antique Carved Wooden Rest Ledge */}
            <div className="w-full h-7 rounded-sm bg-gradient-to-r from-[#24150E] via-[#4A2C1C] to-[#24150E] border-t-2 border-[#D4AF37]/60 shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-between px-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]/70 shadow-sm" />
              <div className="h-[2px] flex-1 mx-4 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]/70 shadow-sm" />
            </div>

            {/* Brass Stand Bracket & Pedestal Pillar */}
            <div className="w-16 h-20 bg-gradient-to-b from-[#8C7132] via-[#5A451A] to-[#2E220B] border-x border-[#D4AF37]/40 shadow-xl" />
            <div className="w-36 h-6 rounded-t-lg bg-gradient-to-r from-[#1B0F09] via-[#3D2316] to-[#1B0F09] border-t border-[#D4AF37]/40" />
          </div>

          {/* StPageFlip Interactive Book */}
          <div
            style={{
              opacity: isBookVisible ? 1 : 0,
              pointerEvents: isBookVisible ? 'auto' : 'none',
              transition: 'opacity 500ms ease',
            }}
            className="relative z-10 w-full max-w-full flex justify-center"
          >
            <StPageFlipBook story={story} />
          </div>
        </div>

        {/* Gentle Opening Hint (Fades in when in reading mode) */}
        {phase === 'reading' && (
          <div className="mt-2 text-center animate-fade-in pointer-events-none">
            <p className="text-xs text-[#D4AF37]/90 font-serif-heading tracking-[0.25em] uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>Tap book cover to open gently</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            </p>
          </div>
        )}
      </main>

      {phase === 'intro' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
          <video
            src={introVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label="Birthday story introduction"
            onEnded={handleIntroEnded}
            onError={handleIntroEnded}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE MOST SIMPLE RED CURTAIN                                               */}
      {/* Pure, clean red fabric panels that part smoothly when tapped             */}
      {/* ========================================================================= */}
      <div
        onClick={handleCurtainTap}
        className={`fixed inset-0 z-50 transition-all duration-700 select-none ${
          phase === 'reading' ? 'pointer-events-none' : 'cursor-pointer'
        }`}
      >
        {/* LEFT RED CURTAIN PANEL */}
        <div
          style={{
            transform: isCurtainOpen ? 'translateX(-100%)' : 'translateX(0%)',
            transition: 'transform 1.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.4s ease',
            opacity: phase === 'reading' ? 0 : 1,
          }}
          className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#500812] via-[#7A101E] to-[#5C0A15] shadow-[15px_0_30px_rgba(0,0,0,0.7)] will-change-transform z-30"
        >
          {/* Natural vertical fabric folds */}
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_40px,rgba(0,0,0,0.4)_50px,transparent_60px)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
          {/* Soft shadow where panels meet */}
          <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* RIGHT RED CURTAIN PANEL */}
        <div
          style={{
            transform: isCurtainOpen ? 'translateX(100%)' : 'translateX(0%)',
            transition: 'transform 1.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.4s ease',
            opacity: phase === 'reading' ? 0 : 1,
          }}
          className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#500812] via-[#7A101E] to-[#5C0A15] shadow-[-15px_0_30px_rgba(0,0,0,0.7)] will-change-transform z-30"
        >
          {/* Natural vertical fabric folds */}
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_40px,rgba(0,0,0,0.4)_50px,transparent_60px)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
          {/* Soft shadow where panels meet */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Minimal Subtle Prompt */}
        {!isCurtainOpen && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <span className="text-[#F4E5BD]/90 font-serif-heading text-xs tracking-[0.35em] uppercase drop-shadow-md animate-pulse">
              tap to open
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
