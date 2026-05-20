"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}

export const CoverImage = memo(function CoverImage({
  src,
  alt,
  width = 120,
  height = 160,
  className,
  fill,
}: CoverImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-jaryq-primary-soft to-jaryq-primary-med/30 rounded-lg",
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <BookOpen
          className="text-jaryq-primary opacity-40"
          size={width ? width * 0.35 : 32}
        />
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setError(true)}
          sizes="(max-width: 768px) 40vw, 20vw"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("rounded-lg object-cover", className)}
      onError={() => setError(true)}
    />
  );
});
