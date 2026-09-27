import Image from "next/image";
import Link from "next/link";
import {
  Landmark,
  Mountain,
  Waves,
  Utensils,
  Drama,
  PawPrint,
  LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  mountain: Mountain,
  waves: Waves,
  utensils: Utensils,
  drama: Drama,
  "paw-print": PawPrint,
};

export default function ExperienceCard({
  label,
  icon,
  image,
}: {
  label: string;
  icon: string;
  image: string;
}) {
  const Icon = ICONS[icon] ?? Landmark;
  return (
    <Link
      href={`/explore?category=${label.toLowerCase()}`}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl block"
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="(min-width: 1024px) 16vw, 45vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/25 transition-colors" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-paper">
        <Icon size={22} strokeWidth={1.5} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}
