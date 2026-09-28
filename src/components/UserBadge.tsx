import { Link } from "wouter";
import type { User } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "./RatingStars";
import { cn } from "@/lib/utils";

interface UserBadgeProps {
  user: User;
  size?: "sm" | "md";
  showRating?: boolean;
  showDistrict?: boolean;
  className?: string;
}

export function UserBadge({
  user,
  size = "md",
  showRating = true,
  showDistrict = false,
  className,
}: UserBadgeProps) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Link
      href={`/users/${user.id}`}
      className={cn("inline-flex items-center gap-2 group", className)}
    >
      <Avatar className={cn(dim, "border border-primary/20 group-hover:border-primary/50 transition-colors")}>
        <AvatarImage src={user.avatarUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className={cn("flex flex-col leading-tight", textSize)}>
        <span className="font-medium group-hover:text-primary transition-colors">
          {user.name}
        </span>
        {showRating && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <RatingStars rating={user.rating} size={11} />
            <span>{user.rating.toFixed(1)} · {user.reviewCount}</span>
          </span>
        )}
        {showDistrict && user.district && (
          <span className="text-xs text-muted-foreground">{user.district}</span>
        )}
      </span>
    </Link>
  );
}
