import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Receipt,
  Package,
  BarChart3,
  ShieldCheck,
  Users,
  Zap,
  Star,
  Menu,
  X,
  TrendingUp,
  FileText,
  Globe,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const socialLinks = [
  {
    name: "Twitter",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    )
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    )
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
        <path d="m10 15 5-3-5-3z"/>
      </svg>
    )
  }
];

  const features = [
    {
      icon: <Receipt size={32} />,
      title: "Invoice Management",
      desc: "Generate professional GST-ready invoices in seconds. Customize templates, send via WhatsApp or email, and track payment status in real time.",
    },
    {
      icon: <Package size={32} />,
      title: "Inventory Control",
      desc: "Manage your entire product catalog, track stock levels, set reorder alerts, and avoid stockouts with smart inventory dashboards.",
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Revenue Analytics",
      desc: "Visualize sales trends, monthly revenue, top-selling products, and customer behavior with interactive charts and exportable reports.",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Bank-Grade Security",
      desc: "Your business data is encrypted end-to-end, backed up automatically, and protected with role-based access controls.",
    },
    {
      icon: <Users size={32} />,
      title: "Customer CRM",
      desc: "Maintain a complete customer ledger, track purchase history, outstanding dues, and build lasting business relationships.",
    },
    {
      icon: <Globe size={32} />,
      title: "Cloud Access",
      desc: "Work from anywhere — your office, home, or phone. All data syncs in real time across every device you own.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: <Zap size={28} />,
      title: "Sign Up Free",
      desc: "Create your account in 60 seconds — no credit card needed. Your account will be Activated.",
    },
    {
      number: "02",
      icon: <Package size={28} />,
      title: "Add Your Products",
      desc: "Import or add your product catalog with prices, HSN codes, and GST rates. Bulk upload supported.",
    },
    {
      number: "03",
      icon: <FileText size={28} />,
      title: "Send Invoices",
      desc: "Create and share professional invoices with one click. Collect payments faster and track every rupee.",
    },
  ];

  const testimonials = [
    {
      initials: "RK",
      name: "Rajesh Kumar",
      role: "Owner",
      company: "Kumar Electronics",
      rating: 5,
      quote:
        "Billing SaaS cut my invoicing time by 70%. I used to spend hours on billing — now it takes minutes. The GST reports alone saved me ₹15,000 in CA fees.",
    },
    {
      initials: "PA",
      name: "Priya Agarwal",
      role: "Director",
      company: "Agarwal Traders",
      rating: 5,
      quote:
        "The inventory and billing integration is seamless. I always know my stock levels and my invoices go out instantly. Best investment for my business.",
    },
    {
      initials: "SM",
      name: "Suresh Mehta",
      role: "Founder",
      company: "Mehta Wholesale",
      rating: 5,
      quote:
        "Switched from manual Excel billing. The analytics dashboard showed me which products were actually profitable. Revenue up 40% in 3 months!",
    },
  ];

  const metrics = [
    { value: "₹50Cr+", label: "Revenue Processed" },
    { value: "50K+", label: "Invoices Generated" },
    { value: "5,000+", label: "Happy Businesses" },
  ];

  const benefits = [
    "Unlimited GST-ready bills",
    "Full customer management",
    "Real-time inventory tracking",
    "Multi-device cloud access",
    "Automated payment reminders",
    "Daily data backups",
    "Export to PDF & Excel",
    "Dedicated support team",
  ];

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className={`landing-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-logo">
          <span className="logo-icon">
            <Receipt size={22} />
          </span>
          Billing<span className="logo-accent">SaaS</span>
        </div>
        <div className={`landing-nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#pricing-cta" onClick={() => setMenuOpen(false)}>Pricing</a>
        </div>
        <div className="landing-nav-buttons">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="register-btn" onClick={() => navigate("/register")}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {/* Mobile nav overlay */}
      {menuOpen && (
        <div className="mobile-nav-overlay">
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#pricing-cta" onClick={() => setMenuOpen(false)}>Pricing</a>
          <button className="login-btn" onClick={() => { navigate("/login"); setMenuOpen(false); }}>Login</button>
          <button className="register-btn" onClick={() => { navigate("/register"); setMenuOpen(false); }}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      )}
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-left">
          <span className="hero-badge">
            <Star size={14} fill="currentColor" />
            Trusted by 5,000+ Businesses Across India
          </span>
          <h1>
            Manage Your Billing{" "}
            <span className="hero-highlight">10× Faster</span>
            — All in One Dashboard.
          </h1>
          <p>
            Create GST invoices, track inventory, monitor revenue, and manage
            customers from a single modern platform built for Indian businesses.
          </p>
          <div className="hero-buttons">
            <button
              className="get-started-btn"
              onClick={() => navigate("/register")}
            >
              Start Free — No Card Needed
              <ArrowRight size={18} />
            </button>
            <button
              className="demo-btn"
              onClick={() => navigate("/login")}
            >
              Login to Dashboard
            </button>
          </div>
          <div className="hero-social-proof">
            <div className="avatar-stack">
              {["RK", "PA", "SM", "VD", "AN"].map((init, i) => (
                <div key={i} className="avatar-chip" style={{ zIndex: 5 - i }}>
                  {init}
                </div>
              ))}
            </div>
            <span>
              <strong>5,000+</strong> businesses trust us
            </span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-blob" />
          <div className="dashboard-card1">
            <div className="dashboard-card-header">
              <h3>Live Dashboard</h3>
              <span className="live-badge">● LIVE</span>
            </div>

            <div className="dashboard-item">
              <div className="dash-item-left">
                <Receipt size={18} />
                <span>Invoices Created</span>
              </div>
              <strong>1,248</strong>
            </div>

            <div className="dashboard-item">
              <div className="dash-item-left">
                <Package size={18} />
                <span>Products</span>
              </div>
              <strong>458</strong>
            </div>

            <div className="dashboard-item">
              <div className="dash-item-left">
                <BarChart3 size={18} />
                <span>Revenue</span>
              </div>
              <strong className="revenue-value">₹2,45,000</strong>
            </div>

            <div className="dashboard-item no-border">
              <div className="dash-item-left">
                <TrendingUp size={18} />
                <span>Growth</span>
              </div>
              <strong className="growth-badge">↑ 24%</strong>
            </div>

            <div className="mini-chart">
              {[40, 65, 50, 80, 70, 90, 85].map((h, i) => (
                <div
                  key={i}
                  className="chart-bar"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── Metrics Strip ── */}
      <section className="metrics-strip">
        {metrics.map((m, i) => (
          <div key={i} className="metric-tile">
            <span className="metric-value">{m.value}</span>
            <span className="metric-label">{m.label}</span>
          </div>
        ))}
      </section>
      {/* ── Features ── */}
      <section className="features" id="features">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2>Everything Your Business Needs</h2>
          <p>
            One platform to replace your billing software, spreadsheets, and
            scattered tools — built specifically for Indian SMBs.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ── How It Works ── */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">Process</span>
          <h2>Up and Running in Minutes</h2>
          <p>No complicated setup. No tech expertise required. Just sign up and start billing.</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{s.number}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>
      {/* ── Benefits / Checklist ── */}
      <section className="benefits">
        <div className="benefits-inner">
          <div className="benefits-left">
            <span className="section-badge light">Why Us</span>
            <h2>All the Tools, None of the Complexity</h2>
            <p>
              Billing SaaS is designed for busy business owners — not accountants.
              No training needed, no setup fees, no long-term contracts.
            </p>
            <button
              className="get-started-btn"
              onClick={() => navigate("/register")}
            >
              Try It Free <ArrowRight size={18} />
            </button>
          </div>
          <div className="benefits-right">
            <div className="benefits-grid">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <CheckCircle size={20} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── Testimonials ── */}
      <section className="testimonials" id="testimonials">
        <div className="section-header">
          <span className="section-badge">Reviews</span>
          <h2>Loved by 5,000+ Business Owners</h2>
          <p>Don't take our word for it — here's what real customers say.</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="stars">
                {[...Array(t.rating)].map((_, si) => (
                  <Star key={si} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initials}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>
                    {t.role}, {t.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ── Pricing CTA Banner ── */}
      <section className="pricing-cta" id="pricing-cta">
        <div className="pricing-cta-inner">
          <span className="section-badge light">Get Started</span>
          <h2>Start Billing Smarter Today</h2>
          <p>
            Join 5,000+ businesses already saving time and money with Billing
            SaaS. Free for All days — no credit card required.
          </p>
          <div className="cta-features">
            {[
              "Free For All Days",
              "No setup fees",
              "Cancel anytime",
              "Dedicated support",
            ].map((item, i) => (
              <span key={i} className="cta-feature-chip">
                <CheckCircle size={14} /> {item}
              </span>
            ))}
          </div>
          <button
            className="cta-main-btn"
            onClick={() => navigate("/register")}
          >
            Create Free Account <ArrowRight size={20} />
          </button>
        </div>
      </section>
      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo footer-logo">
              <span className="logo-icon">
                <Receipt size={20} />
              </span>
              Billing<span className="logo-accent">SaaS</span>
            </div>
            <p>Modern billing & invoicing platform built for Indian businesses.</p>
           <div className="footer-social">
              {socialLinks.map((s, i) => (
                <a 
                  key={i} 
                  href={s.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-chip"
                >
                  <span className="social-icon">{s.icon}</span>
                  <span className="social-label">{s.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#testimonials">Reviews</a>
              <a href="#pricing-cta">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Refund Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} BillingSaaS. Built for modern businesses. All rights reserved.
            </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;