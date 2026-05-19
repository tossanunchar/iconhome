"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
}

interface HeroBannerProps {
  fallback: React.ReactNode;
}

export default function HeroBanner({ fallback }: HeroBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then(r => r.json())
      .then(d => {
        setBanners(d.banners || []);
        setLoaded(true);
      });
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = () => {
    setCurrent(c => (c - 1 + banners.length) % banners.length);
  };

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [banners.length, next]);

  if (!loaded) return null; // SSR fallback renders instead initially
  if (banners.length === 0) return <>{fallback}</>;

  const banner = banners[current];

  return (
    <section className="relative overflow-hidden bg-gray-900" style={{ minHeight: 260 }}>
      {/* Slides */}
      <div className="relative w-full" style={{ minHeight: 260 }}>
        {banner.linkUrl ? (
          <Link href={banner.linkUrl} className="block w-full">
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              width={1920}
              height={480}
              className="w-full object-cover"
              style={{ maxHeight: 480 }}
              priority
            />
          </Link>
        ) : (
          <Image
            src={banner.imageUrl}
            alt={banner.title || "Banner"}
            width={1920}
            height={480}
            className="w-full object-cover"
            style={{ maxHeight: 480 }}
            priority
          />
        )}
      </div>

      {/* Prev / Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-10"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors z-10"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current ? "bg-white w-5 h-2" : "bg-white/50 w-2 h-2"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
