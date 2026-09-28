import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  rating,
  size = 14,
  className,
  showValue = false,
  reviewCount,
}: RatingStarsProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const totalFull = rating - full >= 0.75 ? full + 1 : full;
  const empty = 5 - totalFull - (hasHalf ? 1 : 0);

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-primary", className)}>
      {Array.from({ length: totalFull }).map((_, i) => (
        <Star key={`f-${i}`} width={size} height={size} fill="currentColor" strokeWidth={0} />
      ))}
      {hasHalf && (
        <span className="relative inline-block" style={{ width: size, height: size }}>
          <Star width={size} height={size} className="absolute inset-0 text-muted-foreground/30" fill="currentColor" strokeWidth={0} />
          <StarHalf width={size} height={size} className="absolute inset-0" fill="currentColor" strokeWidth={0} />
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} width={size} height={size} className="text-muted-foreground/30" fill="currentColor" strokeWidth={0} />
      ))}
      {showValue && (
        <span className="ml-1.5 text-foreground text-xs font-medium">
          {rating.toFixed(1)}
          {typeof reviewCount === "number" && (
            <span className="text-muted-foreground font-normal"> · {reviewCount}</span>
          )}
        </span>
      )}
    </span>
  );
}
