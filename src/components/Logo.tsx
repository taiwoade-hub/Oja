import { Link } from "react-router";

export function Logo({ inverse = false, to = "/" }: { inverse?: boolean; to?: string }) {
  return (
    <Link to={to} aria-label="Oja home" className={`brand-mark ${inverse ? "brand-mark--inverse" : ""}`}>
      <span className="brand-dot" aria-hidden="true" />
      <span>oja</span>
    </Link>
  );
}
