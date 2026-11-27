"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { CatalogVideo as Video } from "@/lib/types";
import { cn } from "@/lib/format";

const ytThumb = (id: string, q: "hq" | "maxres" = "hq") => `https://i.ytimg.com/vi/${id}/${q}default.jpg`;
const embed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

/** Poster image for a video: its uploaded poster, else the YouTube thumbnail (null for a file without one) */
export function thumb(video: Pick<Video, "youtubeId" | "posterUrl">, q: "hq" | "maxres" = "hq") {
  return video.posterUrl ?? (video.youtubeId ? ytThumb(video.youtubeId, q) : null);
}

/** Plays the video: YouTube in an iframe, an uploaded file in <video> */
function Player({ video }: { video: Video }) {
  if (video.youtubeId)
    return (
      <iframe
        src={embed(video.youtubeId)}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    );
  return <video src={video.fileUrl} poster={video.posterUrl} controls autoPlay playsInline className="absolute inset-0 size-full bg-black object-contain" />;
}

/** Still frame for a video card: the poster, or the file's first frame */
function Poster({ video, sizes, className }: { video: Video; sizes: string; className: string }) {
  const src = thumb(video, video.short ? "hq" : "maxres");
  if (src) return <Image src={src} alt="" fill sizes={sizes} className={className} />;
  return <video src={`${video.fileUrl}#t=0.5`} preload="metadata" muted playsInline className={cn("absolute inset-0 size-full", className)} />;
}

/** Lightweight YouTube player — loads the iframe only after a click */
export function YouTubeLite({ video, className }: { video: Video; className?: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className={cn("relative overflow-hidden rounded-[1.75rem] bg-night", video.short ? "aspect-[9/16]" : "aspect-video", className)}>
      {play ? (
        <Player video={video} />
      ) : (
        <button onClick={() => setPlay(true)} className="group absolute inset-0 size-full" aria-label={`Play video: ${video.title}`}>
          <Poster video={video} sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-white shadow-2xl transition group-hover:scale-110">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
            <Play className="relative ml-1 size-8 fill-white" />
          </span>
          <span className="absolute inset-x-6 bottom-6 text-left font-display text-xl text-cream sm:text-2xl">{video.title}</span>
        </button>
      )}
    </div>
  );
}

/** Horizontally scrolling rail of YouTube Shorts with a modal player */
export function ShortsRail({ videos, dark }: { videos: Video[]; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Video | null>(null);

  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => scroll(d)}
            aria-label={d < 0 ? "Previous videos" : "Next videos"}
            className={cn(
              "grid size-11 place-items-center rounded-full border transition hover:bg-gold hover:text-ink",
              dark ? "border-white/20 text-cream" : "border-ink/15",
            )}
          >
            {d < 0 ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
        ))}
      </div>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        {videos.map((v, i) => (
          <motion.button
            key={v.id}
            onClick={() => setActive(v)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.6 }}
            className="group relative aspect-[9/16] w-[62%] shrink-0 snap-start overflow-hidden rounded-3xl bg-night-2 text-left sm:w-[38%] md:w-[26%] lg:w-[19%]"
            aria-label={`Play: ${v.title}`}
          >
            <Poster video={v} sizes="300px" className={cn("object-cover transition duration-700", v.youtubeId ? "scale-[1.35] group-hover:scale-[1.45]" : "group-hover:scale-105")} />
            <span className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent" />
            <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:bg-brand">
              <Play className="ml-0.5 size-4 fill-white text-white" />
            </span>
            <span className="absolute inset-x-4 bottom-4 line-clamp-3 text-sm font-semibold leading-snug text-cream">{v.title}</span>
          </motion.button>
        ))}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </div>
  );
}

/** Fullscreen YouTube player overlay. Pass `null` to close. */
export function VideoModal({ video, onClose }: { video: Video | null; onClose: () => void }) {
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[80] grid place-items-center bg-night/90 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className={cn("relative w-full overflow-hidden rounded-3xl bg-black", video.short ? "aspect-[9/16] max-h-[85vh] max-w-[min(420px,calc(85vh*9/16))]" : "aspect-video max-w-5xl")}
          >
            <Player video={video} />
          </motion.div>
          <button onClick={onClose} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25" aria-label="Close video">
            <X className="size-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
