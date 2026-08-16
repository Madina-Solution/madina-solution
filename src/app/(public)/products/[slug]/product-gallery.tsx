"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  thumbnail: string | null;
  gallery: string[];
  productName: string;
};

export function ProductGallery({ thumbnail, gallery, productName }: Props) {
  const allImages = thumbnail ? [thumbnail, ...gallery] : gallery;
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);

  const hasMultipleImages = allImages.length > 1;

  const goToPrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // Placeholder if no images
  if (allImages.length === 0) {
    return (
      <div className="sticky top-24">
        <div className="aspect-square overflow-hidden rounded-2xl bg-dark-100">
          <div className="flex h-full items-center justify-center">
            <span className="text-8xl font-bold text-dark-300">
              {productName.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-dark-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-full items-center justify-center"
          >
            {/* Placeholder - replace with actual Image component when images are available */}
            <span className="text-8xl font-bold text-dark-300">
              {productName.charAt(0)}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 bg-white/80 hover:bg-white"
          onClick={() => setIsZoomed(true)}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-dark/70 px-3 py-1 text-sm text-white">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-dark-100 transition-all",
                selectedIndex === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:ring-2 hover:ring-dark-200"
              )}
            >
              <div className="flex h-full items-center justify-center">
                <span className="text-2xl font-bold text-dark-300">
                  {productName.charAt(0)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/90 p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
            >
              <div className="flex h-[80vh] w-[80vw] items-center justify-center rounded-2xl bg-white">
                <span className="text-9xl font-bold text-dark-300">
                  {productName.charAt(0)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
