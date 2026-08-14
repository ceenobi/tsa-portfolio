import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export default function Logo({ className }: LogoProps) {
  const location = useLocation()
  const isAuth = location.pathname.includes('auth')
  return (
    <Link to="/" className={cn("flex items-center gap-2 w-fit", className)}>
      <img src={isAuth ? "/tsalogo.svg" : "/images/logo.svg"} alt="Tech Studio Academy Logo" />
    </Link>
  );
}
