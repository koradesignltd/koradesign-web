import { Instagram, Youtube, Linkedin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// TikTok icon (lucide doesn't ship one we can rely on across versions)
function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.3V15a6 6 0 1 1-6-6c.34 0 .67.03 1 .09v3.18a3 3 0 1 0 2 2.83V3h3z" />
    </svg>
  );
}

export interface Social {
  label: string;
  href: string;
  Icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const SOCIALS: Social[] = [
  { label: "Instagram", href: "https://www.instagram.com/koradesignltd/", Icon: Instagram },
  { label: "TikTok", href: "https://www.tiktok.com/@koradesignltd", Icon: TiktokIcon },
  { label: "YouTube", href: "https://www.youtube.com/@koradesignltd", Icon: Youtube },
  { label: "LinkedIn", href: "https://rw.linkedin.com/company/koradesignltd", Icon: Linkedin },
];
