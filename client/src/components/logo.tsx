import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img src="/images/logo.svg" alt="Tech Studio Academy Logo" />
    </div>
  );
}
