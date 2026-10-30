"use client";

import { LazyMotion, domAnimation, MotionConfig, m } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
