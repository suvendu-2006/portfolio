import { MaskReveal } from "@/components/mask-reveal";
import { Reveal } from "@/components/reveal";

export function SectionHeading({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-10 max-w-2xl sm:mb-14">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
        {index}
      </p>
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        <MaskReveal delay={0.08}>{title}</MaskReveal>
      </h2>
      {description ? <p className="mt-3 text-base leading-relaxed text-soft">{description}</p> : null}
    </Reveal>
  );
}
