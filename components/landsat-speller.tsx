"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { landsatCatalog, LandsatItem } from "@/data/landsat";
import { Reveal } from "@/components/reveal";
import { HairLine } from "@/components/hairline";

export function LandsatSpeller() {
  const [text, setText] = useState("SHUV");
  const [inputValue, setInputValue] = useState("SHUV");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [variantOffsets, setVariantOffsets] = useState<Record<number, number>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Read URL query param on mount if present (e.g. ?name=EARTH)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    if (nameParam) {
      const clean = nameParam.trim().slice(0, 16);
      if (clean) {
        setText(clean);
        setInputValue(clean);
      }
    }
  }, []);

  // Synchronize input with text
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputValue.trim().slice(0, 16);
    setText(clean || "SHUV");
    setSelectedIndex(0);
  };

  const chars = useMemo(() => {
    return text.split("");
  }, [text]);

  // Construct card data for each character
  const cards = useMemo(() => {
    const charCounts: Record<string, number> = {};

    return chars.map((char, idx) => {
      const lower = char.toLowerCase();
      const isSpace = char === " ";
      const variants = landsatCatalog[lower];

      if (isSpace || !variants || variants.length === 0) {
        return {
          char,
          isSpace,
          isUnknown: !isSpace,
          item: null,
          index: idx,
          variantIndex: 0,
          totalVariants: 0,
        };
      }

      const occurrence = charCounts[lower] || 0;
      charCounts[lower] = occurrence + 1;

      const manualOffset = variantOffsets[idx] || 0;
      const variantIndex = (occurrence + manualOffset) % variants.length;
      const item = variants[variantIndex];

      return {
        char: char.toUpperCase(),
        isSpace: false,
        isUnknown: false,
        item,
        index: idx,
        variantIndex,
        totalVariants: variants.length,
      };
    });
  }, [chars, variantOffsets]);

  // Ensure selectedIndex is within bounds
  useEffect(() => {
    if (selectedIndex >= cards.length && cards.length > 0) {
      setSelectedIndex(0);
    }
  }, [cards.length, selectedIndex]);

  // Close QR modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsQrModalOpen(false);
      }
    };
    if (isQrModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQrModalOpen]);

  const activeCard = cards[selectedIndex] || cards[0];

  const cycleVariantAt = (idx: number) => {
    setVariantOffsets((prev) => ({
      ...prev,
      [idx]: (prev[idx] || 0) + 1,
    }));
  };

  const shuffleAll = () => {
    const nextOffsets: Record<number, number> = {};
    chars.forEach((_, i) => {
      nextOffsets[i] = Math.floor(Math.random() * 10);
    });
    setVariantOffsets(nextOffsets);
  };

  // Calculate proportional card height based on card count so cards stay grand and fit nicely
  const cardHeightClass = useMemo(() => {
    if (cards.length > 10) {
      return "h-[250px] xs:h-[290px] sm:h-[350px] md:h-[400px] lg:h-[450px]";
    }
    if (cards.length > 6) {
      return "h-[270px] xs:h-[320px] sm:h-[380px] md:h-[440px] lg:h-[490px]";
    }
    return "h-[290px] xs:h-[350px] sm:h-[420px] md:h-[480px] lg:h-[530px]";
  }, [cards.length]);

  // Calculate maximum card width based on card count
  const cardMaxWidthClass = useMemo(() => {
    if (cards.length > 10) {
      return "max-w-[110px]";
    }
    if (cards.length > 6) {
      return "max-w-[150px]";
    }
    return "max-w-[200px]";
  }, [cards.length]);

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?name=${encodeURIComponent(text)}#landsat`;
  };

  // Open QR modal and generate QR code
  const handleOpenQr = async () => {
    setIsQrModalOpen(true);
    try {
      const shareUrl = getShareUrl();
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#09090b",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  // Copy shareable URL to clipboard
  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy link error:", err);
    }
  };

  // Download composed banner as a high-res image
  const handleDownload = async () => {
    if (typeof window === "undefined" || cards.length === 0) return;
    setIsExporting(true);

    try {
      const validCards = cards.filter((c) => !c.isSpace && c.item);
      if (validCards.length === 0) return;

      const cardWidth = 340;
      const cardHeight = 750;
      const gap = 16;
      const paddingX = 80;
      const paddingTop = 80;
      const paddingBottom = 130;

      const totalWidth = paddingX * 2 + validCards.length * cardWidth + (validCards.length - 1) * gap;
      const totalHeight = paddingTop + cardHeight + paddingBottom;

      const canvas = document.createElement("canvas");
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark NASA background
      ctx.fillStyle = "#070709";
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Load all images
      const loadedImages = await Promise.all(
        validCards.map(
          (c) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.src = c.item!.file;
              img.onload = () => resolve(img);
              img.onerror = reject;
            })
        )
      );

      // Draw strips
      loadedImages.forEach((img, i) => {
        const x = paddingX + i * (cardWidth + gap);
        const y = paddingTop;

        ctx.save();
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + cardWidth - r, y);
        ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + r);
        ctx.lineTo(x + cardWidth, y + cardHeight - r);
        ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - r, y + cardHeight);
        ctx.lineTo(x + r, y + cardHeight);
        ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, cardWidth, cardHeight);
        ctx.restore();
      });

      // Draw Title under banner
      const nameString = validCards.map((c) => c.char).join(" ");
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 58px system-ui, -apple-system, sans-serif";
      ctx.letterSpacing = "0.2em";
      ctx.fillText(nameString, totalWidth / 2, paddingTop + cardHeight + 80);

      // Trigger download
      const link = document.createElement("a");
      link.download = `landsat-${text.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section
      id="landsat"
      aria-label="Wanna see a surprise"
      className="scroll-mt-20 border-t border-line py-10 sm:py-16"
    >
      <HairLine />
      <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl">
              wanna see a{" "}
              <span className="font-serif font-medium text-accent">surprise</span>
            </h2>
          </div>
        </Reveal>

        {/* Proportional Non-Sliding Strips Display */}
        <div
          ref={containerRef}
          className="relative mt-6 sm:mt-10 flex w-full items-center justify-center pt-6 pb-2"
        >
          {cards.length === 0 ? (
            <div className="flex h-64 w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/20 p-6 text-muted">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Type your name to begin</p>
              <p className="mt-1.5 text-sm sm:text-base text-muted">Enter letters or digits below</p>
            </div>
          ) : (
            <div className="flex w-full max-w-[1400px] items-end justify-center gap-1 sm:gap-2 md:gap-2.5 px-1 sm:px-2">
              {cards.map((card, idx) => {
                const isSelected = idx === selectedIndex;

                if (card.isSpace) {
                  return (
                    <div
                      key={`space-${idx}`}
                      className={`flex ${cardHeightClass} w-2 sm:w-4 md:w-6 shrink-0 items-center justify-center`}
                    >
                      <div className="h-16 w-px bg-line/60" />
                    </div>
                  );
                }

                if (card.isUnknown || !card.item) {
                  return (
                    <div
                      key={`unknown-${idx}`}
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative flex-1 min-w-0 ${cardMaxWidthClass} ${cardHeightClass} flex flex-col items-center justify-center rounded-[4px] border border-line bg-panel/40 transition-all duration-300 ${
                        isSelected
                          ? "-translate-y-4 sm:-translate-y-6 shadow-2xl ring-2 ring-accent"
                          : "hover:-translate-y-1.5"
                      }`}
                    >
                      <span className="font-display text-xl sm:text-2xl font-bold text-muted">{card.char}</span>
                      <span className="mt-1 text-[9px] uppercase tracking-wider text-muted/50">N/A</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${card.char}-${idx}-${card.item.id}`}
                    onClick={() => {
                      if (isSelected) {
                        cycleVariantAt(idx);
                      } else {
                        setSelectedIndex(idx);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group relative flex-1 min-w-0 ${cardMaxWidthClass} ${cardHeightClass} cursor-pointer overflow-hidden rounded-[4px] border transition-all duration-300 ease-out select-none ${
                      isSelected
                        ? "-translate-y-4 sm:-translate-y-6 z-20 border-accent/90 shadow-2xl shadow-accent/20 ring-2 ring-accent/70"
                        : "border-line/60 opacity-90 hover:opacity-100 hover:-translate-y-1.5 hover:border-line hover:z-10"
                    }`}
                    title={`${card.char} · ${card.item.place} (Click to switch variant)`}
                  >
                    {/* Satellite Slice Image */}
                    <Image
                      src={card.item.file}
                      alt={`${card.char} - ${card.item.place}`}
                      fill
                      sizes="(max-width: 640px) 140px, (max-width: 1024px) 240px, 320px"
                      className="object-cover"
                      priority={idx < 6}
                    />

                    {/* Subtle top letter marker */}
                    <div
                      className={`absolute left-1.5 top-1.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded font-mono text-[10px] sm:text-xs font-bold backdrop-blur-md transition-opacity duration-200 ${
                        isSelected
                          ? "bg-bg/90 text-accent opacity-100 border border-accent/40 shadow-sm"
                          : "bg-bg/60 text-ink/80 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {card.char}
                    </div>

                    {/* Variant indicator */}
                    {card.totalVariants > 1 && (
                      <div
                        className={`absolute right-1.5 top-1.5 rounded bg-bg/85 px-1 sm:px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px] text-muted backdrop-blur-md transition-opacity border border-line/40 ${
                          isSelected ? "opacity-100 text-accent border-accent/40" : "opacity-0 group-hover:opacity-85"
                        }`}
                      >
                        {card.variantIndex + 1}/{card.totalVariants}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Input Dock */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md sm:max-w-lg items-center rounded-2xl border border-line bg-panel/95 p-1.5 sm:p-2 shadow-xl backdrop-blur-md transition-all focus-within:border-accent/90 focus-within:ring-2 focus-within:ring-accent/40"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value.slice(0, 16);
                setInputValue(val);
                setText(val);
                setSelectedIndex(0);
              }}
              placeholder="Type your name or word..."
              maxLength={16}
              className="min-w-0 flex-1 bg-transparent px-3.5 sm:px-5 py-2 font-mono text-base sm:text-lg tracking-wide text-ink placeholder:text-muted/40 focus:outline-none"
            />

            <button
              type="submit"
              className="rounded-xl border border-line/80 bg-panel px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-ink hover:border-accent hover:bg-bg hover:text-accent transition-colors"
            >
              Enter
            </button>

            {/* Download Banner Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting || cards.length === 0}
              className="ml-1.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-line/80 bg-panel text-muted hover:border-accent hover:bg-bg hover:text-ink transition-colors disabled:opacity-40"
              title="Download satellite strip banner (PNG)"
              aria-label="Download banner image"
            >
              {isExporting ? (
                <svg className="h-4 w-4 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
            </button>

            {/* Shuffle Variations Button */}
            <button
              type="button"
              onClick={shuffleAll}
              className="ml-1.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-line/80 bg-panel text-muted hover:border-accent hover:bg-bg hover:text-ink transition-colors"
              title="Shuffle all letter variations"
              aria-label="Shuffle variations"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 3h5v5" />
                <path d="M4 20L21 3" />
                <path d="M21 16v5h-5" />
                <path d="M15 15l6 6" />
                <path d="M4 4l5 5" />
              </svg>
            </button>

            {/* QR Code Share Button */}
            <button
              type="button"
              onClick={handleOpenQr}
              className="ml-1.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-line/80 bg-panel text-muted hover:border-accent hover:bg-bg hover:text-ink transition-colors"
              title="Generate QR code to share"
              aria-label="Generate QR code"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Top-left corner marker */}
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="6" y="6" width="1" height="1" fill="currentColor" stroke="none" />
                {/* Top-right corner marker */}
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="17" y="6" width="1" height="1" fill="currentColor" stroke="none" />
                {/* Bottom-left corner marker */}
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="6" y="17" width="1" height="1" fill="currentColor" stroke="none" />
                {/* QR payload dots */}
                <path d="M14 14h2v2h-2z" fill="currentColor" stroke="none" />
                <path d="M19 14v3" />
                <path d="M14 20h6" />
              </svg>
            </button>
          </form>

          {/* Selected Card Location & Coordinates Display */}
          <div className="mt-4 sm:mt-5 min-h-[56px] text-center">
            {activeCard?.item ? (
              <div className="transition-all duration-300">
                <p className="font-display text-lg sm:text-2xl font-bold tracking-tight text-ink">
                  {activeCard.item.place}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
                  {activeCard.item.coords ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeCard.item.coords
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/map inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm text-accent hover:underline transition-colors"
                      title="Open coordinates in Google Maps"
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-accent group-hover/map:scale-110 transition-transform"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{activeCard.item.coords}</span>
                      <svg
                        className="h-3 w-3 opacity-60 group-hover/map:opacity-100 transition-opacity"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-muted">Earth Coordinates</span>
                  )}

                  {activeCard.item.coords && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <span>(</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          activeCard.item.coords
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-ink hover:underline text-muted/90"
                        title="Open in Google Maps"
                      >
                        Google Maps
                      </a>
                      <span>·</span>
                      <a
                        href={`https://maps.apple.com/?q=${encodeURIComponent(
                          activeCard.item.coords
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-ink hover:underline text-muted/90"
                        title="Open in Apple Maps"
                      >
                        Apple Maps
                      </a>
                      <span>)</span>
                    </div>
                  )}

                  {activeCard.item.date && (
                    <span className="text-muted/60 text-xs sm:text-sm">· {activeCard.item.date}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">Select or hover any card to inspect location and coordinates</p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Share Modal */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-muted hover:border-accent hover:text-ink transition-colors"
              aria-label="Close QR popup"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Share · Landsat Composite
              </span>
              <h3 className="mt-1 font-display text-lg sm:text-xl font-bold tracking-tight text-ink">
                Scan to View or Share
              </h3>
              <p className="mt-1 text-xs text-muted max-w-xs mx-auto">
                Scan this QR code with your mobile camera to open your Landsat name externally.
              </p>

              {/* QR Code Container */}
              <div className="mt-5 flex flex-col items-center justify-center">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-black/5">
                  {qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCodeUrl}
                      alt={`QR code for ${text}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted">
                      <svg className="h-6 w-6 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="mt-2 font-mono text-xs text-muted">Generating QR...</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-line/60 bg-bg/80 px-3 py-1 font-mono text-xs text-ink">
                  <span className="text-muted">Spelling:</span>
                  <span className="font-bold text-accent">{text || "EARTH"}</span>
                </div>
              </div>

              {/* Link and Actions */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-bg/90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink hover:border-accent hover:text-accent transition-colors shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <svg
                        className="h-4 w-4 text-accent"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-accent">Link Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 text-muted"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span>Copy Shareable Link</span>
                    </>
                  )}
                </button>

                {qrCodeUrl && (
                  <a
                    href={qrCodeUrl}
                    download={`landsat-${(text || "earth").toLowerCase().replace(/[^a-z0-9]/g, "-")}-qr.png`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-line/60 bg-panel px-4 py-2 text-xs font-medium text-muted hover:border-accent hover:text-ink transition-colors"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download QR Image</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
