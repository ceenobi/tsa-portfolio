import { Link } from "react-router";

export default function Logo() {
  return (
    <div className="w-40">
      <Link to="/" className="w-40">
        <img src="/tsalogo.svg" alt="tsalogo" />
      </Link>
    </div>
  );
}
