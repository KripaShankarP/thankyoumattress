"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/format";
import { MattressPreview } from "./MattressPreview";
import { usePreviewColour } from "./previewColour";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const preview = usePreviewColour();
  // The colour preview slide is shown once a colour is picked
  const [showPreview, setShowPreview] = useState(false);
  const previewing = !!preview && showPreview;

  // Picking a colour jumps to the preview — reacting to the external colour store
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (preview) setShowPreview(true);
  }, [preview?.colour.name]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 md:flex-row">
      <div className="no-scrollbar flex gap-3 overflow-x-auto md:max-h-[600px] md:flex-col md:overflow-y-auto">
        {preview && (
          <button
            onClick={() => setShowPreview(true)}
            className={cn(
              "relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand ring-2 transition",
              previewing
                ? "ring-brand"
                : "ring-transparent opacity-70 hover:opacity-100",
            )}
            aria-label={`Show ${preview.colour.name} colour preview`}
          >
            <span
              className="h-7 w-12 -skew-x-12 rounded-md shadow-md ring-1 ring-inset ring-black/15"
              style={{ background: preview.colour.hex }}
            />
            <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-bold">
              Your colour
            </span>
          </button>
        )}
        {images.map((src, idx) => (
          <button
            key={src}
            onClick={() => {
              setI(idx);
              setShowPreview(false);
            }}
            className={cn(
              "relative size-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition",
              idx === i && !previewing
                ? "ring-brand"
                : "ring-transparent opacity-70 hover:opacity-100",
            )}
            aria-label={`Show image ${idx + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      <div
        className={cn(
          "relative aspect-square flex-1 overflow-hidden rounded-[2rem] bg-sand",
          !previewing && "cursor-zoom-in",
        )}
        onMouseMove={(e) => {
          if (previewing) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          {previewing ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <MattressPreview
                colour={preview.colour}
                thickness={preview.thickness}
              />
            </motion.div>
          ) : (
            <motion.div
              key={images[i]}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={images[i]}
                alt={`${name} — image ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-200"
                style={
                  zoom
                    ? {
                        transform: "scale(1.8)",
                        transformOrigin: `${zoom.x}% ${zoom.y}%`,
                      }
                    : undefined
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!previewing && (
          <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold backdrop-blur">
            {i + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
