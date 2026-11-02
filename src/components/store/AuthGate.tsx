import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children, title = "Your Oja account, all in one place." }: { children: ReactNode; title?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="page-container auth-gate"><div className="skeleton auth-skeleton" /></div>;
  if (!isAuthenticated) return <div className="page-container auth-gate"><LockKeyhole size={28} strokeWidth={1.5} /><span className="mono-label">MEMBERS & GUESTS</span><h1>{title}</h1><p>Sign in to save pieces, manage your bag and follow every order. You can always keep browsing as a guest.</p><div><Link to="/login" className="btn-primary">Sign in</Link><Link to="/explore" className="btn-secondary">Continue browsing</Link></div></div>;
  return children;
}
