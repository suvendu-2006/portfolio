"use client";

import Image from "next/image";
import { useState, type ComponentProps } from "react";

/** next/image that fades in once it has actually loaded. */
export function FadeImage({ className = "", alt = "", ...props }: ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      alt={alt}
      {...props}
      className={`${className} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setLoaded(true)}
    />
  );
}
