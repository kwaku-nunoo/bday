import React, { useRef, useState, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, BookOpen, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import { StoryData, PolaroidMemory } from '../types/story';
import { globalAudioEngine } from '../services/AudioEngine';
import { VintageDustOverlay } from './VintageDustOverlay';
import { OfficePushPin, OFFICE_PIN_COLORS, PinColor } from './OfficePushPin';

interface StPageFlipBookProps {
  story: StoryData;
}

// Forward-ref page container required by react-pageflip
const Page = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      children: React.ReactNode;
      className?: string;
      isHard?: boolean;
      pageNumber?: number;
      onClick?: (e: React.MouseEvent) => void;
    }
  >((props, ref) => {
    return (
      <div
        ref={ref}
        onClick={props.onClick}
        data-density={props.isHard ? 'hard' : 'soft'}
        className={`page-sheet h-full w-full overflow-hidden select-none relative will-change-transform ${props.className || ''}`}
        style={{ transform: 'translateZ(0)' }}
      >
        {props.children}
        {/* Subtle, slow-moving CSS dust particles overlay on individual storybook pages */}
        <VintageDustOverlay density="subtle" />
      </div>
    );
  })
);

Page.displayName = 'Page';

const isVideoAsset = (src: string) => /\.(mp4|webm|ogg|mov)$/i.test(src);

export const StPageFlipBook: React.FC<StPageFlipBookProps> = ({ story }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [isOpeningCover, setIsOpeningCover] = useState<boolean>(false);

  // Active focus modal state:
  const [focusModal, setFocusModal] = useState<{
    polaroid: PolaroidMemory;
    pinColor?: PinColor;
  } | null>(null);

  // Office push pin removal & return animation states
  const [unpinningPinId, setUnpinningPinId] = useState<string | null>(null);
  const [returningPinId, setReturningPinId] = useState<string | null>(null);
  const [isModalClosing, setIsModalClosing] = useState<boolean>(false);

  // Subtle tactile 3D tilt tracking for focused polaroid
  const [tilt, setTilt] = useState<{ x: number; y: number; sheenX: number; sheenY: number }>({
    x: 0,
    y: 0,
    sheenX: 50,
    sheenY: 50,
  });
  const [isTiltActive, setIsTiltActive] = useState<boolean>(false);
  const tiltFrameRef = useRef<number | null>(null);

  const handleModalMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeModalRef.current || isModalClosing) return;

    if (tiltFrameRef.current !== null) {
      return;
    }

    tiltFrameRef.current = requestAnimationFrame(() => {
      const rect = activeModalRef.current?.getBoundingClientRect();
      if (!rect) {
        tiltFrameRef.current = null;
        return;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / (rect.width / 2);
      const normY = (e.clientY - centerY) / (rect.height / 2);

      const clampedX = Math.max(-1.3, Math.min(1.3, normX));
      const clampedY = Math.max(-1.3, Math.min(1.3, normY));

      const rotY = clampedX * 8.5;
      const rotX = -clampedY * 7.5;
      const sheenX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const sheenY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      setTilt({ x: rotX, y: rotY, sheenX, sheenY });
      setIsTiltActive(true);
      tiltFrameRef.current = null;
    });
  }, [isModalClosing]);

  const handleModalMouseLeave = useCallback(() => {
    if (tiltFrameRef.current !== null) {
      cancelAnimationFrame(tiltFrameRef.current);
      tiltFrameRef.current = null;
    }
    setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    setIsTiltActive(false);
  }, []);

  const activeModalRef = useRef<HTMLDivElement | null>(null);
  const isFlippingRef = useRef<boolean>(false);
  const flipSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetFlippingLock = useCallback(() => {
    isFlippingRef.current = false;
    if (flipSafetyTimerRef.current) {
      clearTimeout(flipSafetyTimerRef.current);
      flipSafetyTimerRef.current = null;
    }
  }, []);

  // Debounced page turn sound trigger so flips always play crisp sound without doubling
  const lastSoundTimeRef = useRef<number>(0);
  const triggerPageTurnSound = useCallback(() => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 350) {
      lastSoundTimeRef.current = now;
      globalAudioEngine.playPageTurnSound();
    }
  }, []);

  // Sound & flip tracking
  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPageIndex(e.data);
    resetFlippingLock();
    if (e.data > 0) {
      setIsOpeningCover(true);
    } else {
      setIsOpeningCover(false);
    }
    triggerPageTurnSound();
  }, [resetFlippingLock, triggerPageTurnSound]);

  const handleChangeState = useCallback((e: { data: string }) => {
    if (e.data === 'flipping') {
      isFlippingRef.current = true;
      triggerPageTurnSound();
      if (flipSafetyTimerRef.current) clearTimeout(flipSafetyTimerRef.current);
      flipSafetyTimerRef.current = setTimeout(() => {
        isFlippingRef.current = false;
      }, 2500);

      if (bookRef.current?.pageFlip) {
        try {
          const pageFlip = bookRef.current.pageFlip();
          const page = pageFlip.getCurrentPageIndex();
          const calc = pageFlip.getFlipController()?.getCalculation();
          const dir = calc?.getDirection(); // 1 = prev (closing cover), 0 = next (opening)
          if (dir === 1 && page <= 1) {
            setIsOpeningCover(false);
          } else if (dir === 0 && page === 0) {
            setIsOpeningCover(true);
          }
        } catch {
          if (currentPageIndex === 0) {
            setIsOpeningCover(true);
          } else if (currentPageIndex <= 1) {
            setIsOpeningCover(false);
          }
        }
      }
    } else if (e.data === 'read') {
      resetFlippingLock();
      if (bookRef.current?.pageFlip) {
        try {
          const page = bookRef.current.pageFlip().getCurrentPageIndex();
          if (page === 0) {
            setIsOpeningCover(false);
          } else {
            setIsOpeningCover(true);
          }
        } catch {
          // fallback
        }
      }
    }
  }, [currentPageIndex, resetFlippingLock, triggerPageTurnSound]);

  const handleInit = useCallback((e: { page: number }) => {
    setCurrentPageIndex(e.page || 0);
    isFlippingRef.current = false;
    if (e.page > 0) setIsOpeningCover(true);
    if (bookRef.current?.pageFlip) {
      setTotalPages(bookRef.current.pageFlip().getPageCount() || 10);
    }
  }, []);

  const handleNext = () => {
    if (isFlippingRef.current) return;
    triggerPageTurnSound();
    if (currentPageIndex === 0) {
      handleTurnTo(1);
      return;
    }
    if (bookRef.current?.pageFlip) {
      isFlippingRef.current = true;
      bookRef.current.pageFlip().flipNext();
    }
  };

  const handlePrev = () => {
    if (isFlippingRef.current) return;
    triggerPageTurnSound();
    if (currentPageIndex <= 1) {
      setIsOpeningCover(false);
      handleTurnTo(0);
      return;
    }
    if (bookRef.current?.pageFlip) {
      isFlippingRef.current = true;
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handleTurnTo = (page: number) => {
    triggerPageTurnSound();
    if (page === 0) {
      setIsOpeningCover(false);
    } else {
      setIsOpeningCover(true);
    }
    if (bookRef.current?.pageFlip) {
      isFlippingRef.current = true;
      try {
        if (page === 0 || currentPageIndex === 0) {
          bookRef.current.pageFlip().getSettings().flippingTime = 2200;
        }
      } catch {
        // fallback
      }
      bookRef.current.pageFlip().flip(page);
    }
  };

  useEffect(() => {
    return () => {
      if (tiltFrameRef.current !== null) {
        cancelAnimationFrame(tiltFrameRef.current);
      }
    };
  }, []);

  // Explicit Cover Click Handler: stops propagation to prevent double-flip and opens strictly to Chapter 1 slowly and smoothly
  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFlippingRef.current) return;
    triggerPageTurnSound();
    if (currentPageIndex === 0) {
      if (bookRef.current?.pageFlip) {
        try {
          bookRef.current.pageFlip().getSettings().flippingTime = 2200;
        } catch {
          // fallback
        }
      }
      handleTurnTo(1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusModal) {
        if (e.key === 'Escape') setFocusModal(null);
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusModal, currentPageIndex]);

  // Open focus modal (unpins gently and lifts into focus)
  const openPolaroidFocus = (polaroid: PolaroidMemory, pinColor?: PinColor) => {
    if (unpinningPinId || returningPinId) return;
    triggerPageTurnSound();
    setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    setIsTiltActive(false);

    if (pinColor) {
      // Step 1: gently remove/pull out the office push pin
      setUnpinningPinId(polaroid.id);
      setTimeout(() => {
        setUnpinningPinId(null);
        setFocusModal({ polaroid, pinColor });
      }, 300);
    } else {
      setFocusModal({ polaroid });
    }
  };

  // Click on enlarged photo to return it to the book, then pin it back
  const handleEnlargedClick = () => {
    if (!focusModal || isModalClosing) return;
    triggerPageTurnSound();
    setIsModalClosing(true);
    setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
    setIsTiltActive(false);

    const closedId = focusModal.polaroid.id;
    const hasPin = !!focusModal.pinColor;

    setTimeout(() => {
      setFocusModal(null);
      setIsModalClosing(false);

      if (hasPin) {
        // Step 2: photo has returned to the book, now the pin slowly comes down to pin it back there!
        setReturningPinId(closedId);
        setTimeout(() => {
          setReturningPinId(null);
        }, 700);
      }
    }, 220);
  };

  /**
   * Synchronized centering shift:
   * When on cover (Page 0 and not flipping open), book shifts left by 25% to center the cover.
   * When cover starts flipping open, it glides over 900ms in perfect sync with the cover flip animation!
   */
  const getShiftTransform = () => {
    if (currentPageIndex === 0 && !isOpeningCover) {
      return 'translateX(-25%)';
    }
    if (currentPageIndex >= totalPages - 1) {
      return 'translateX(25%)';
    }
    return 'translateX(0)';
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-2 sm:p-3 z-20">
      {/* Top Navigation Ribbon Bar */}
      <header
        aria-label="Storybook Navigation"
        className="w-full max-w-3xl flex items-center justify-between px-4 py-1.5 mb-2.5 bg-[#241C18]/85 backdrop-blur-md rounded-full border border-[#C5A059]/35 text-[#E5D7C7] text-xs font-serif-heading shadow-xl select-none"
      >
        <button
          onClick={() => handleTurnTo(0)}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-stone-800 text-[#C5A059] hover:text-[#FFDF73] transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="tracking-wider uppercase text-[10px]">Cover</span>
        </button>

        {/* Spread indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] tracking-widest text-[#E8D4BE]">
            {currentPageIndex === 0
              ? 'COVER'
              : currentPageIndex >= totalPages - 1
              ? 'BACK COVER'
              : `PAGES ${currentPageIndex} - ${currentPageIndex + 1} OF ${totalPages}`}
          </span>
          <span className="text-[10px] text-stone-400 italic hidden sm:inline">
            · Click corner or page to turn
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentPageIndex <= 0}
            type="button"
            aria-label="Previous Page"
            className={`p-1.5 rounded-full transition-colors ${
              currentPageIndex <= 0
                ? 'text-stone-600 cursor-not-allowed'
                : 'text-[#C5A059] hover:bg-stone-800 hover:text-[#FFDF73] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentPageIndex >= totalPages - 1}
            type="button"
            aria-label="Next Page"
            className={`p-1.5 rounded-full transition-colors ${
              currentPageIndex >= totalPages - 1
                ? 'text-stone-600 cursor-not-allowed'
                : 'text-[#C5A059] hover:bg-stone-800 hover:text-[#FFDF73] cursor-pointer'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Book Stage with Synchronized Slow & Smooth Physical Flip Animation */}
      <main className="w-full flex items-center justify-center my-auto min-h-[520px] sm:min-h-[580px] overflow-visible">
        <div
          style={{
            transform: getShiftTransform(),
            transition: 'transform 2200ms cubic-bezier(0.33, 1, 0.68, 1)',
          }}
          className="will-change-transform flex justify-center relative"
        >
          {/* @ts-expect-error react-pageflip typings */}
          <HTMLFlipBook
            ref={bookRef}
            width={420}
            height={550}
            size="stretch"
            minWidth={280}
            maxWidth={450}
            minHeight={420}
            maxHeight={600}
            maxShadowOpacity={0.85}
            showCover={true}
            flippingTime={2200} // Slow, ultra-smooth 2200ms physical book turning
            usePortrait={false} // Guarantees both pages are always visible side-by-side
            mobileScrollSupport={true}
            clickEventForward={false}
            useMouseEvents={true}
            disableFlipByClick={true}
            showPageCorners={true}
            drawShadow={true}
            onFlip={handleFlip}
            onChangeState={handleChangeState}
            onInit={handleInit}
            className="shadow-[0_30px_90px_-10px_rgba(0,0,0,0.95)] rounded-lg"
          >
            {/* ========================================================= */}
            {/* PAGE 0: HARD FRONT COVER                                  */}
            {/* Minimalist vintage brown rough leather cover with ONLY    */}
            {/* a centered, very thin, elegant "HAPPY BIRTHDAY"           */}
            {/* ========================================================= */}
            <Page
              isHard={true}
              onClick={handleCoverClick}
              className="relative p-6 sm:p-8 flex flex-col items-center justify-center border-r border-[#C5A059]/40 overflow-hidden cursor-pointer rough-vintage-leather"
            >
              {/* Physical Embossed Book Spine Hinge Shadow */}
              <div className="absolute left-0 inset-y-0 w-5 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none z-20" />
              <div className="absolute left-4 inset-y-0 w-[1px] bg-[#D4AF37]/20 pointer-events-none z-20" />

              {/* Delicate Thin Inset Border */}
              <div className="absolute inset-5 sm:inset-6 border border-[#C5A059]/30 rounded-md pointer-events-none shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]" />

              {/* The Only Element: Centered Very Thin Small HAPPY BIRTHDAY */}
              <div className="relative z-10 text-center flex items-center justify-center my-auto px-4">
                <h1
                  style={{
                    paddingTop: '-1px',
                    paddingLeft: '4px',
                    paddingRight: '2px',
                    paddingBottom: '10px',
                    marginLeft: '-2px',
                    marginTop: '92px',
                    marginRight: '3px',
                    marginBottom: '0px',
                  }}
                  className="font-serif-heading font-light text-base sm:text-lg tracking-[0.32em] text-[#F4E5BD] gold-foil-text uppercase select-none"
                >
                  HAPPY BIRTHDAY
                </h1>
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 1 (LEFT): CHAPTER I - BIRTHDAY MESSAGE FROM ME     */}
            {/* Perfectly sized to prevent any overflow                   */}
            {/* ========================================================= */}
            <Page isHard={true} className="bg-parchment p-4 sm:p-5 flex flex-col justify-between border-r border-[#D9CEBC]/60 relative">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1">
                <span>Chapter 1</span>
                <span>Page 1</span>
              </div>

              <div className="my-auto py-1">
                <div className="flex items-center gap-1.5 text-[#C5A059] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[9.5px] uppercase tracking-[0.2em] font-serif-heading font-semibold text-[#8C6D58]">
                    From Me to You
                  </span>
                </div>

                {story.chapter1Headline && (
                  <h2 className="text-lg sm:text-xl font-serif-heading font-medium text-[#2C211B] mb-2 tracking-tight">
                    {story.chapter1Headline}
                  </h2>
                )}

                <div className="space-y-1 text-[9.1px] sm:text-[9.8px] font-literary-body text-[#473932] leading-[1.5]">
                  {story.chapter1LetterBody.map((para, i) => (
                    <p key={i} className="m-0">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-[#E8DDCD]">
                  <p className="font-david-mergens text-base text-[#2C211B]">
                    Forever your loyal friend,
                  </p>
                  <p className="text-[8.5px] text-[#8C7B6E] font-serif-heading tracking-wider uppercase mt-0.5">
                    Your Best Friend
                  </p>
                </div>
              </div>

              <div className="text-right text-[8.5px] text-[#A69788] font-literary-body italic">
                Our Memories →
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 1 (RIGHT): CHAPTER I - 3 POLAROIDS (ME & HER)      */}
            {/* Sized to fit comfortably inside the page without overflow */}
            {/* ========================================================= */}
            <Page className="bg-parchment p-3 sm:p-4 flex flex-col justify-between border-l border-[#D9CEBC]/40 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1 z-30 relative">
                <span>Chapter 1</span>
                <span>Memories</span>
              </div>

              {/* 3 Polaroids Scatter Fan - Scaled to fit completely */}
              <div className="relative my-auto w-full h-[320px] sm:h-[350px]">
                {/* Polaroid 1 (Top Center/Left tilt) */}
                {story.chapter1Polaroids[0] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter1Polaroids[0]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      width: '106px',
                    }}
                    className="absolute top-1 left-1/2 -translate-x-[48%] -rotate-[5deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_8px_18px_rgba(44,35,30,0.18)] hover:shadow-[0_16px_30px_rgba(44,35,30,0.3)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-10"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape rotate-2 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs">
                      <img
                        src={story.chapter1Polaroids[0].imageSrc}
                        alt={story.chapter1Polaroids[0].title}
                        className="w-full h-full object-cover filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Polaroid 2 (Bottom Left tilt) */}
                {story.chapter1Polaroids[1] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter1Polaroids[1]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '38px',
                      width: '107px',
                    }}
                    className="absolute bottom-2 left-3 sm:left-5 rotate-[4deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_10px_20px_rgba(44,35,30,0.2)] hover:shadow-[0_16px_30px_rgba(44,35,30,0.3)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-20"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape -rotate-3 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs">
                      <img
                        src={story.chapter1Polaroids[1].imageSrc}
                        alt={story.chapter1Polaroids[1].title}
                        className="w-full h-full object-cover filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Polaroid 3 (Bottom Right tilt) */}
                {story.chapter1Polaroids[2] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter1Polaroids[2]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '44px',
                      paddingBottom: '12px',
                      paddingTop: '7px',
                      paddingLeft: '8px',
                      paddingRight: '10px',
                      marginLeft: '24px',
                      marginRight: '-16px',
                      width: '121px',
                    }}
                    className="absolute bottom-1 right-3 sm:right-5 -rotate-[3deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_12px_24px_rgba(44,35,30,0.22)] hover:shadow-[0_18px_32px_rgba(44,35,30,0.32)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-30"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape rotate-1 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs">
                      <img
                        src={story.chapter1Polaroids[2].imageSrc}
                        alt={story.chapter1Polaroids[2].title}
                        className="w-full h-full object-cover filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-[8.5px] text-[#8C7A6B] font-literary-body italic z-30 relative">
                Click photo to focus · Click again to go back
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 2 (LEFT): CHAPTER II - FREDRICKA'S MESSAGE (TWINS) */}
            {/* Sized cleanly to prevent any overflow                     */}
            {/* ========================================================= */}
            <Page className="bg-parchment p-4 sm:p-5 flex flex-col justify-between border-r border-[#D9CEBC]/60 relative">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1">
                <span>Chapter 2</span>
                <span>Page 3</span>
              </div>

              <div className="my-auto py-1">
                <div className="flex items-center gap-1.5 text-[#B35C52] mb-1">
                  <span className="text-sm">👭</span>
                  <span className="text-[9.5px] uppercase tracking-[0.2em] font-serif-heading font-semibold text-[#8C2818]">
                    From Fredricka (Your Twin)
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-serif-heading font-medium text-[#2C211B] mb-2 tracking-tight">
                  {story.chapter2FriendTribute.headline}
                </h2>

                <div className="space-y-1 text-[10.2px] sm:text-[10.7px] font-literary-body text-[#473932] leading-[1.45]">
                  {story.chapter1LetterBody.map((para, i) => (
                    <p key={i} className="m-0">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-[#E8DDCD] flex items-center justify-between">
                  <div>
                    <p className="font-david-mergens text-lg text-[#2C211B]">
                      Love you endlessly, Fredricka
                    </p>
                    <p className="text-[9px] text-[#8C7B6E] font-serif-heading tracking-wider uppercase mt-0.5">
                      Your Twin & Soul Sister
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#8C2818] text-[#F9E8B2] flex items-center justify-center font-display-classic text-xs font-bold shadow-xs">
                    ❤
                  </div>
                </div>
              </div>

              <div className="text-right text-[8.5px] text-[#A69788] font-literary-body italic">
                Twin Memories →
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 2 (RIGHT): CHAPTER II - 3 POLAROIDS (TWINS)        */}
            {/* Sized cleanly to fit inside the page boundaries           */}
            {/* ========================================================= */}
            <Page className="bg-parchment p-3 sm:p-4 flex flex-col justify-between border-l border-[#D9CEBC]/40 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1 z-30 relative">
                <span>Chapter 2</span>
                <span>The Twins</span>
              </div>

              {/* 3 Polaroids Scatter Arrangement - Scaled to fit completely */}
              <div className="relative my-auto w-full h-[320px] sm:h-[350px]">
                {/* Polaroid 1 (Top Center/Left tilt) */}
                {story.chapter2FriendTribute.polaroids[0] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter2FriendTribute.polaroids[0]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      width: '106px',
                    }}
                    className="absolute top-1 left-1/2 -translate-x-[48%] -rotate-[5deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_8px_18px_rgba(44,35,30,0.18)] hover:shadow-[0_16px_30px_rgba(44,35,30,0.3)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-10"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape rotate-2 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs">
                      <img
                        src={story.chapter2FriendTribute.polaroids[0].imageSrc}
                        alt={story.chapter2FriendTribute.polaroids[0].title}
                        className="w-full h-full object-cover object-top filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Polaroid 2 (Bottom Left tilt) */}
                {story.chapter2FriendTribute.polaroids[1] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter2FriendTribute.polaroids[1]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '38px',
                      width: '107px',
                    }}
                    className="absolute bottom-2 left-3 sm:left-5 rotate-[4deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_10px_20px_rgba(44,35,30,0.2)] hover:shadow-[0_16px_30px_rgba(44,35,30,0.3)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-20"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape -rotate-3 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs">
                      <img
                        src={story.chapter2FriendTribute.polaroids[1].imageSrc}
                        alt={story.chapter2FriendTribute.polaroids[1].title}
                        className="w-full h-full object-cover object-top filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Polaroid 3 (Bottom Right tilt) */}
                {story.chapter2FriendTribute.polaroids[2] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter2FriendTribute.polaroids[2]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '44px',
                      paddingBottom: '12px',
                      paddingTop: '7px',
                      paddingLeft: '8px',
                      paddingRight: '10px',
                      marginLeft: '24px',
                      marginRight: '-16px',
                      width: '121px',
                    }}
                    className="absolute bottom-1 right-3 sm:right-5 -rotate-[3deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_12px_24px_rgba(44,35,30,0.22)] hover:shadow-[0_18px_32px_rgba(44,35,30,0.32)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-30"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape rotate-1 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs">
                      <img
                        src={story.chapter2FriendTribute.polaroids[2].imageSrc}
                        alt={story.chapter2FriendTribute.polaroids[2].title}
                        className="w-full h-full object-cover object-top filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-[8.5px] text-[#8C7A6B] font-literary-body italic z-30 relative">
                Turn page for Chapter 3
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 3 (LEFT): CHAPTER III - 9 POLAROIDS (3x3 SIDE A)   */}
            {/* ========================================================= */}
            {/* SPREAD 3 (LEFT): CHAPTER III - CORKBOARD COLLAGE (SIDE A) */}
            {/* Modeled after corkboard photo wall with colorful pins     */}
            {/* ========================================================= */}
            <Page className="bg-parchment p-3 sm:p-3.5 flex flex-col justify-between border-r border-[#D9CEBC]/60 relative">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1 z-30 relative">
                <span>Chapter 3</span>
                <span>Side A</span>
              </div>

              {/* Framed Corkboard Pinboard Collage (Like Reference Photo) */}
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="relative my-auto w-full h-[320px] sm:h-[350px] p-1.5 sm:p-2 bg-corkboard rounded-xs border-3 border-[#2A1C15] shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_6px_16px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden"
              >
                <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5 items-center justify-items-center w-full h-full">
                  {story.chapter3LeftPolaroids.map((polaroid, index) => {
                    const pinColor = OFFICE_PIN_COLORS[index % OFFICE_PIN_COLORS.length];
                    const isCenterHero = index === 4;
                    const isRemoving = unpinningPinId === polaroid.id;
                    const isReturning = returningPinId === polaroid.id;

                    return (
                      <div
                        key={polaroid.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openPolaroidFocus(polaroid, pinColor);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        style={{
                          transform: `rotate(${isCenterHero ? -2 : polaroid.rotation}deg)`,
                        }}
                        className={`group relative ${
                          isCenterHero
                            ? 'w-[82px] sm:w-[94px] p-1 pb-3 sm:pb-4 z-20 shadow-[0_8px_18px_rgba(0,0,0,0.38)]'
                            : 'w-[64px] sm:w-[74px] p-0.5 sm:p-1 pb-2 sm:pb-2.5 z-10 shadow-[0_3px_8px_rgba(0,0,0,0.26)]'
                        } ${isRemoving ? 'scale-105 z-30 transition-transform duration-200' : ''} bg-white rounded-[2px] border border-[#DDD5C7] hover:scale-108 hover:z-30 hover:shadow-2xl transition-all cursor-pointer select-none`}
                      >
                        {/* Office Push Pin of different color at top */}
                        <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                          <OfficePushPin
                            color={pinColor}
                            size={isCenterHero ? 'md' : 'sm'}
                            isRemoving={isRemoving}
                            isReturning={isReturning}
                          />
                        </div>

                        {/* Pure Polaroid Photo Frame - Clean with NO text underneath */}
                        <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-[1px]">
                          {isVideoAsset(polaroid.imageSrc) ? (
                            <video
                              src={polaroid.imageSrc}
                              autoPlay={false}
                              loop
                              muted
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover filter contrast-[1.03]"
                            />
                          ) : (
                            <img
                              src={polaroid.imageSrc}
                              alt={polaroid.title}
                              className="w-full h-full object-cover filter contrast-[1.03]"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        {/* Wide white polaroid chin - blank with NO text written underneath */}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center text-[8px] text-[#8C7A6B] font-literary-body italic">
                Pinned Memories · Tap photo to unpin & focus
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 3 (RIGHT): CHAPTER III - CORKBOARD COLLAGE (SIDE B)*/}
            {/* Modeled after corkboard photo wall with colorful pins     */}
            {/* ========================================================= */}
            <Page className="bg-parchment p-3 sm:p-3.5 flex flex-col justify-between border-l border-[#D9CEBC]/40 relative">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1 z-30 relative">
                <span>Chapter 3</span>
                <span>Side B</span>
              </div>

              {/* Framed Corkboard Pinboard Collage (Like Reference Photo) */}
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="relative my-auto w-full h-[320px] sm:h-[350px] p-1.5 sm:p-2 bg-corkboard rounded-xs border-3 border-[#2A1C15] shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_6px_16px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden"
              >
                <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5 items-center justify-items-center w-full h-full">
                  {story.chapter3RightPolaroids.map((polaroid, index) => {
                    const pinColor = OFFICE_PIN_COLORS[(index + 3) % OFFICE_PIN_COLORS.length];
                    const isCenterHero = index === 4;
                    const isRemoving = unpinningPinId === polaroid.id;
                    const isReturning = returningPinId === polaroid.id;

                    return (
                      <div
                        key={polaroid.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openPolaroidFocus(polaroid, pinColor);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        style={{
                          transform: `rotate(${isCenterHero ? 2 : polaroid.rotation}deg)`,
                        }}
                        className={`group relative ${
                          isCenterHero
                            ? 'w-[82px] sm:w-[94px] p-1 pb-3 sm:pb-4 z-20 shadow-[0_8px_18px_rgba(0,0,0,0.38)]'
                            : 'w-[64px] sm:w-[74px] p-0.5 sm:p-1 pb-2 sm:pb-2.5 z-10 shadow-[0_3px_8px_rgba(0,0,0,0.26)]'
                        } ${isRemoving ? 'scale-105 z-30 transition-transform duration-200' : ''} bg-white rounded-[2px] border border-[#DDD5C7] hover:scale-108 hover:z-30 hover:shadow-2xl transition-all cursor-pointer select-none`}
                      >
                        {/* Office Push Pin of different color at top */}
                        <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                          <OfficePushPin
                            color={pinColor}
                            size={isCenterHero ? 'md' : 'sm'}
                            isRemoving={isRemoving}
                            isReturning={isReturning}
                          />
                        </div>

                        {/* Pure Polaroid Photo Frame - Clean with NO text underneath */}
                        <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-[1px]">
                          {isVideoAsset(polaroid.imageSrc) ? (
                            <video
                              src={polaroid.imageSrc}
                              autoPlay={false}
                              loop
                              muted
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover filter contrast-[1.03]"
                            />
                          ) : (
                            <img
                              src={polaroid.imageSrc}
                              alt={polaroid.title}
                              className="w-full h-full object-cover filter contrast-[1.03]"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        {/* Wide white polaroid chin - blank with NO text written underneath */}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-right text-[8px] text-[#A69788] font-literary-body italic">
                Turn page for Chapter 4 →
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 4 (LEFT): CHAPTER IV - BIRTHDAY WISHES & TOAST     */}
            {/* Sized cleanly to fit inside the page boundaries           */}
            {/* ========================================================= */}
            {/* ========================================================= */}
            {/* SPREAD 4 (LEFT): CHAPTER IV - PICTURES ONLY               */}
            {/* Sized cleanly to fit inside the page boundaries           */}
            {/* ========================================================= */}
            <Page className="bg-parchment p-3 sm:p-4 flex flex-col justify-between border-r border-[#D9CEBC]/60 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1 z-30 relative">
                <span>Chapter 4</span>
                <span>Page 7</span>
              </div>

              {/* 3 Polaroids Scatter Arrangement - Pictures Only */}
              <div className="relative my-auto w-full h-[320px] sm:h-[350px]">
                {/* Polaroid 1 (Top Center/Left tilt) */}
                {story.chapter1Polaroids[0] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter1Polaroids[0]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '10px',
                      marginLeft: '0px',
                      width: '135px',
                    }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 -rotate-[2deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_12px_24px_rgba(44,35,30,0.22)] hover:shadow-[0_18px_32px_rgba(44,35,30,0.32)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-10"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape rotate-2 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs mb-1">
                      <img
                        src={story.chapter1Polaroids[0].imageSrc}
                        alt={story.chapter1Polaroids[0].title}
                        className="w-full h-full object-cover filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Polaroid 2 (Bottom Left tilt) */}
                {story.chapter1Polaroids[1] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter1Polaroids[1]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '38px',
                      width: '107px',
                    }}
                    className="absolute bottom-2 left-3 sm:left-5 rotate-[4deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_10px_20px_rgba(44,35,30,0.2)] hover:shadow-[0_16px_30px_rgba(44,35,30,0.3)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-20"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape -rotate-3 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs mb-1">
                      <img
                        src={story.chapter1Polaroids[1].imageSrc}
                        alt={story.chapter1Polaroids[1].title}
                        className="w-full h-full object-cover filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Polaroid 3 (Bottom Right tilt) */}
                {story.chapter1Polaroids[2] && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPolaroidFocus(story.chapter1Polaroids[2]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      marginBottom: '44px',
                      paddingBottom: '12px',
                      paddingTop: '7px',
                      paddingLeft: '8px',
                      paddingRight: '10px',
                      marginLeft: '24px',
                      marginRight: '-16px',
                      width: '121px',
                    }}
                    className="absolute bottom-1 right-3 sm:right-5 -rotate-[3deg] p-1.5 pb-3 bg-[#FAF7F0] border border-[#DCD1BF] rounded-xs shadow-[0_12px_24px_rgba(44,35,30,0.22)] hover:shadow-[0_18px_32px_rgba(44,35,30,0.32)] hover:scale-105 hover:z-40 transition-all cursor-pointer z-30"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 washi-tape rotate-1 pointer-events-none z-10" />
                    <div className="relative aspect-square overflow-hidden bg-stone-300 rounded-xs mb-1">
                      <img
                        src={story.chapter1Polaroids[2].imageSrc}
                        alt={story.chapter1Polaroids[2].title}
                        className="w-full h-full object-cover filter contrast-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: '-19px',
                  marginBottom: '0px',
                }}
                className="text-center text-[8.5px] text-[#8C7A6B] font-literary-body italic z-30 relative"
              >
                Click photo to focus
              </div>
            </Page>

            {/* ========================================================= */}
            {/* SPREAD 4 (RIGHT): FINALE - THE END IN RELYAGIH SERIF FONT */}
            {/* Just these 2: THE END and closing note                    */}
            {/* ========================================================= */}
            <Page isHard={true} className="bg-parchment p-4 sm:p-5 flex flex-col justify-between border-l border-[#D9CEBC]/40 relative">
              <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] font-serif-heading tracking-widest uppercase border-b border-[#E3D8C8] pb-1">
                <span>The Final Frame</span>
                <span>Page 8</span>
              </div>

              <div className="my-auto py-2 text-center flex flex-col items-center justify-center">
                {/* THE END */}
                <h2
                  style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontStyle: 'italic',
                    fontSize: '44px',
                    marginTop: '100px',
                  }}
                  className="text-[#2C211B] gold-foil-text tracking-[0.2em] mb-4 drop-shadow-xs"
                >
                  THE END
                </h2>

                <p
                  style={{
                    fontSize: '15px',
                    textAlign: 'left',
                    fontStyle: 'italic',
                  }}
                  className="font-david-mergens text-[#5A453A] w-full px-4"
                >
                  “{story.closingNote}”
                </p>
              </div>
            </Page>

            {/* ========================================================= */}
            {/* PAGE 9: HARD BACK COVER                                  */}
            {/* Vintage brown rough texture, gold emblem, read again      */}
            {/* ========================================================= */}
            <Page
              isHard={true}
              className="bg-book-cover rough-vintage-leather text-[#F7F2EC] p-5 sm:p-7 flex flex-col justify-between border-l border-[#C5A059]/40 relative"
            >
              <div className="absolute inset-4 sm:inset-5 border border-[#C5A059]/30 rounded-l-xl pointer-events-none" />

              <div className="text-center pt-3">
                <p className="text-[9.5px] uppercase tracking-[0.3em] text-[#C5A059] font-serif-heading">
                  Keepsake Edition
                </p>
              </div>

              <div className="text-center my-auto py-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#382C24] border border-[#C5A059]/50 flex items-center justify-center font-display-classic text-lg font-bold text-[#F4E5BD] mb-2.5 shadow-md">
                  ❤
                </div>

                <p className="font-david-mergens text-2xl text-[#E8D4BE] mb-2">
                  “Until the next chapter…”
                </p>

                <button
                  onClick={() => handleTurnTo(0)}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#8C2818] to-[#5C160B] text-[#F9E8B2] border border-[#D4AF37]/50 text-xs font-serif-heading transition-all shadow-lg hover:scale-105 cursor-pointer mt-3"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Read Again from Cover</span>
                </button>
              </div>

              <div className="text-center pb-2 text-[8.5px] text-stone-500 font-literary-body">
                Chronicles of Caroline · {new Date().getFullYear()}
              </div>
            </Page>
          </HTMLFlipBook>

          {/* Subtle slow-moving CSS dust particle overlay across the storybook spread */}
          <VintageDustOverlay density="standard" className="z-30 pointer-events-none rounded-lg" />
        </div>
      </main>

      {/* Floating Bottom Navigation Ribbons */}
      <nav
        aria-label="Storybook page controls"
        className="w-full max-w-3xl flex items-center justify-between mt-3 px-2 select-none"
      >
        <button
          onClick={handlePrev}
          disabled={currentPageIndex <= 0}
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#201915]/85 hover:bg-[#2F2520] text-[#D8C6A5] border border-[#C5A059]/35 text-xs font-serif-heading transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 text-[#C5A059]" />
          <span>{currentPageIndex <= 1 ? 'Cover' : 'Previous'}</span>
        </button>

        <span className="text-[11px] text-stone-400 font-literary-body hidden sm:inline italic">
          Click or peel any page corner to turn
        </span>

        {currentPageIndex < totalPages - 1 ? (
          <button
            onClick={handleNext}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#201915]/85 hover:bg-[#2F2520] text-[#D8C6A5] border border-[#C5A059]/35 text-xs font-serif-heading transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Next Page</span>
            <ChevronRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        ) : (
          <button
            onClick={() => handleTurnTo(0)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#8C2818] to-[#5C160B] text-[#F9E8B2] border border-[#D4AF37]/50 text-xs font-serif-heading transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Read Again</span>
          </button>
        )}
      </nav>

      {/* ENLARGED POLAROID FOCUS MODAL WITH 3D TACTILE TILT */}
      {focusModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-200 [perspective:1100px] ${
            isModalClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleEnlargedClick}
          onMouseMove={handleModalMouseMove}
          onMouseLeave={handleModalMouseLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleEnlargedClick();
            if (e.key === 'Enter' || e.key === ' ') handleEnlargedClick();
          }}
        >
          <div
            ref={activeModalRef}
            onClick={(e) => {
              e.stopPropagation();
              handleEnlargedClick();
            }}
            style={{
              transform: isModalClosing
                ? 'rotateX(0deg) rotateY(0deg) scale3d(0.95, 0.95, 1)'
                : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1)`,
              transition: isTiltActive && !isModalClosing
                ? 'transform 0.12s ease-out, box-shadow 0.14s ease-out'
                : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
              transformStyle: 'preserve-3d',
              boxShadow: `${-tilt.y * 1.8}px ${26 + tilt.x * 1.5}px 70px rgba(0,0,0,0.85)`,
            }}
            className="group relative max-w-sm sm:max-w-md w-full p-3 sm:p-4 pb-10 sm:pb-14 bg-[#FAF7F0] rounded-[3px] border border-[#E3D8C8] cursor-pointer select-none will-change-transform"
          >
            {/* Close button in top-right with parallax depth */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnlargedClick();
              }}
              style={{ transform: 'translateZ(32px)' }}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#2C211B] text-[#F9E8B2] border border-[#C5A059] flex items-center justify-center shadow-lg z-30 hover:scale-110 transition-transform cursor-pointer"
              aria-label="Close photo"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Fastener: Office Push Pin or Washi Tape with tactile parallax floating */}
            {focusModal.pinColor ? (
              <div
                style={{ transform: 'translateZ(26px)' }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none filter drop-shadow-md"
              >
                <OfficePushPin color={focusModal.pinColor} size="lg" />
              </div>
            ) : (
              <div
                style={{ transform: 'translateZ(20px)' }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape rotate-1 shadow-sm z-20 pointer-events-none"
              />
            )}

            {/* Photo Preview Container - Pure Polaroid Picture with specular film glint */}
            <div
              style={{ transform: 'translateZ(12px)' }}
              className="relative aspect-square sm:aspect-[4/5] max-h-[460px] sm:max-h-[520px] overflow-hidden bg-stone-300 rounded-[2px] shadow-xs"
            >
              {isVideoAsset(focusModal.polaroid.imageSrc) ? (
                <video
                  src={focusModal.polaroid.imageSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover object-top filter contrast-[1.04]"
                />
              ) : (
                <img
                  src={focusModal.polaroid.imageSrc}
                  alt={focusModal.polaroid.title}
                  className="w-full h-full object-cover object-top filter contrast-[1.04]"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Dynamic 3D Specular Light Glint that follows mouse movement */}
              <div
                style={{
                  background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 30%, transparent 65%)`,
                  opacity: isTiltActive ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                }}
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
              />
            </div>

            {/* Subtle paper reflection sheen on Polaroid frame */}
            <div
              style={{
                background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255,255,255,0.35) 0%, transparent 60%)`,
                opacity: isTiltActive ? 0.7 : 0,
                transition: 'opacity 0.25s ease',
              }}
              className="absolute inset-0 pointer-events-none rounded-[3px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
