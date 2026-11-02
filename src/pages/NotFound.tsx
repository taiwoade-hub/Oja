import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return <main className="not-found"><Logo /><div><span className="mono-label">ERROR 404</span><h1>Wrong turn.<br />Good recovery.</h1><p>The page you’re looking for isn’t part of this collection.</p><Link to="/" className="btn-primary"><ArrowLeft size={16} /> Back to Oja</Link></div></main>;
}
