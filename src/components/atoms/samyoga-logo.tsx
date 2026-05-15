import Image from "next/image";
import { BRANDING } from "@/shared/config/branding";

type LogoProps = {
  className?: string;
};

/** Gradient lotus mark — favicon-friendly; portrait aspect (~97×120). */
export function SamyogaLogoMark({ className = "", priority = true }: LogoProps & { priority?: boolean }) {
  return (
    <Image
      src={BRANDING.logoMarkSvg}
      alt=""
      width={49}
      height={60}
      sizes="3rem"
      priority={priority}
      className={`h-11 w-auto object-contain object-left sm:h-12 ${className}`.trim()}
      aria-hidden
    />
  );
}

/** Full horizontal wordmark on transparent background. */
export function SamyogaLogoWordmark({ className = "", priority }: LogoProps & { priority?: boolean }) {
  return (
    <Image
      src={BRANDING.logoWordmarkPng}
      alt="Samyoga"
      width={420}
      height={112}
      sizes="(max-width: 768px) min(92vw, 420px) min(42vw, 420px)"
      priority={priority}
      className={`h-11 w-auto max-w-full object-contain object-left sm:h-[3.25rem] ${className}`.trim()}
    />
  );
}
