import { Link } from "react-router";

export default function Logo() {
  return (
    <Link to="/" className="w-fit">
      <img src="/tsalogo.svg" alt="tsalogo" />
    </Link>
  );
}
