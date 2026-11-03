import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck, Sparkles, User } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { Logo } from "@/components/Logo";

type TabType = "signin" | "signup" | "admin";

export default function Login({ initialTab }: { initialTab?: TabType }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const utils = trpc.useUtils();

  const queryTab = (searchParams.get("tab") || searchParams.get("role")) as TabType | null;
  const defaultTab: TabType =
    queryTab === "admin" || initialTab === "admin"
      ? "admin"
      : queryTab === "signup" || initialTab === "signup"
      ? "signup"
      : "signin";

  const [tab, setTab] = useState<TabType>(defaultTab);

  useEffect(() => {
    if (queryTab === "admin" || initialTab === "admin") {
      setTab("admin");
    } else if (queryTab === "signup" || initialTab === "signup") {
      setTab("signup");
    }
  }, [queryTab, initialTab]);

  // Customer Sign In states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Admin Login states
  const [adminEmail, setAdminEmail] = useState("admin@oja.store");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Sign up states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      // Immediately prime query cache to prevent race conditions during route change
      if (data.user) {
        utils.auth.me.setData(undefined, data.user);
      }
      await utils.auth.me.invalidate();
      await utils.shop.cart.invalidate();
      await utils.shop.wishlist.invalidate();

      const userName = data.user?.name ?? (data.user?.role === "admin" ? "Store Administrator" : "Customer");
      if (data.user?.role === "admin") {
        toast.success(`Welcome back, ${userName}! Opening operations…`);
        navigate("/admin");
      } else {
        toast.success(`Welcome back, ${userName}!`);
        navigate("/");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign in. Please check your credentials.");
    },
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async (data) => {
      if (data.user) {
        utils.auth.me.setData(undefined, data.user);
      }
      await utils.auth.me.invalidate();
      await utils.shop.cart.invalidate();
      await utils.shop.wishlist.invalidate();
      const userName = data.user?.name ?? "Customer";
      toast.success(`Welcome to Oja, ${userName}! Your account has been created.`);
      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Could not complete registration.");
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    const emailTrimmed = loginEmail.trim();
    const isAdmin = emailTrimmed.toLowerCase() === "admin@oja.store" || emailTrimmed.toLowerCase().includes("admin");
    loginMutation.mutate({
      role: isAdmin ? "admin" : "user",
      email: emailTrimmed,
      password: loginPassword,
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = adminEmail.trim() || "admin@oja.store";
    loginMutation.mutate({
      role: "admin",
      email: targetEmail,
      password: adminPassword,
    });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please accept the terms to create an account.");
      return;
    }
    signupMutation.mutate({
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
    });
  };

  const handleQuickDemo = (role: "user" | "admin") => {
    if (role === "admin") {
      loginMutation.mutate({
        role: "admin",
        email: "admin@oja.store",
      });
    } else {
      loginMutation.mutate({
        role: "user",
        email: "amara@example.com",
      });
    }
  };

  const isSubmitting = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="auth-page-container">
      {/* Top utility bar */}
      <header className="auth-top-bar">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <Logo />
        <div className="auth-top-spacer" />
      </header>

      <main className="auth-content">
        <div className="auth-card-wrapper">
          {/* Brand header badge */}
          <div className="auth-header">
            <span className="mono-label">
              {tab === "admin"
                ? "OJA OPERATIONS · ADMIN PORTAL"
                : "OJA STUDIO · ACCOUNT ACCESS"}
            </span>
            <h1>
              {tab === "admin"
                ? "Store Administrator"
                : tab === "signin"
                ? "Welcome back."
                : "Create your account."}
            </h1>
            <p>
              {tab === "admin"
                ? "Sign in with administrator credentials to manage catalog, orders, and store operations."
                : tab === "signin"
                ? "Sign in to track orders, save considered pieces, and manage your Lagos delivery address."
                : "Join Oja for curated edits, swift express checkout, and personal order tracking."}
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="auth-tabs auth-tabs--triple" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signin"}
              className={`auth-tab ${tab === "signin" ? "active" : ""}`}
              onClick={() => setTab("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "admin"}
              className={`auth-tab auth-tab--admin ${tab === "admin" ? "active" : ""}`}
              onClick={() => {
                setTab("admin");
                setAdminEmail("admin@oja.store");
              }}
            >
              <ShieldCheck size={14} /> Admin
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "signup"}
              className={`auth-tab ${tab === "signup" ? "active" : ""}`}
              onClick={() => setTab("signup")}
            >
              Register
            </button>
          </div>

          {/* 1. ADMIN LOGIN FORM */}
          {tab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="auth-form">
              <label>
                Administrator email
                <div className="auth-input-wrapper">
                  <ShieldCheck size={17} className="auth-input-icon text-orange-600" />
                  <input
                    type="email"
                    required
                    placeholder="admin@oja.store"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <label>
                <div className="auth-label-row">
                  <span>Administrator password</span>
                  <span className="text-xs text-muted">Demo: any key</span>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    aria-label={showAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="btn-primary auth-submit-btn auth-submit-btn--admin"
                disabled={isSubmitting}
              >
                <ShieldCheck size={16} />
                {loginMutation.isPending ? "Verifying administrator…" : "Sign In to Admin Workspace"}
              </button>

              <button
                type="button"
                className="btn-secondary auth-demo-btn auth-demo-btn--highlight"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo("admin")}
              >
                <Sparkles size={14} /> 1-Click Store Admin Instant Sign In
              </button>
            </form>
          )}

          {/* 2. CUSTOMER SIGN IN FORM */}
          {tab === "signin" && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label>
                Email address
                <div className="auth-input-wrapper">
                  <Mail size={17} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="amara@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <label>
                <div className="auth-label-row">
                  <span>Password</span>
                  <button
                    type="button"
                    className="auth-link-text"
                    onClick={() => toast.info("Password reset link will be sent to your email.")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <div className="auth-options-row">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this browser</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={isSubmitting}
              >
                {loginMutation.isPending ? "Signing in…" : "Sign In to Oja"}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* 3. CREATE ACCOUNT FORM */}
          {tab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <label>
                Full name
                <div className="auth-input-wrapper">
                  <User size={17} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Amara Okafor"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    autoComplete="name"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <label>
                Email address
                <div className="auth-input-wrapper">
                  <Mail size={17} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="amara@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <label>
                Create password
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <div className="auth-options-row">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span>I agree to Oja’s Terms of Service & Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={isSubmitting}
              >
                {signupMutation.isPending ? "Creating account…" : "Create My Oja Account"}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Banner for rapid testing */}
          <div className="auth-demo-box">
            <div className="auth-demo-heading">
              <Sparkles size={14} />
              <span>Instant Testing Logins</span>
            </div>
            <div className="auth-demo-actions">
              <button
                type="button"
                className="btn-secondary auth-demo-btn auth-demo-btn--admin"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo("admin")}
              >
                <ShieldCheck size={15} />
                <span>1-Click Store Admin</span>
              </button>
              <button
                type="button"
                className="btn-secondary auth-demo-btn"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo("user")}
              >
                <User size={15} />
                <span>1-Click Customer (Amara)</span>
              </button>
            </div>
          </div>

          {/* Trust markers */}
          <footer className="auth-card-footer">
            <div className="auth-trust-item">
              <ShieldCheck size={15} />
              <span>256-bit encrypted session</span>
            </div>
            <div className="auth-trust-item">
              <Check size={14} />
              <span>Lagos & nationwide delivery</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
