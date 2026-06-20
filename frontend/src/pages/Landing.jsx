import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CarFront,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import "../assets/css/Landing.css";

const Landing = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <main className="landing-container">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-logo">
          <CarFront size={28} color="#3b82f6" />
          <span>ParkNova</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="nav-link">
            Sign In
          </Link>
          <Link to="/register" className="btn-nav-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="hero-badge">
              <Zap size={16} color="#60a5fa" /> v2.0 is now live
            </motion.div>
            <motion.h1 variants={fadeInUp} className="hero-title">
              Intelligent Parking for the <br />
              Modern Enterprise
            </motion.h1>
            <motion.p variants={fadeInUp} className="hero-subtitle">
              Seamlessly manage multiple locations, optimize pricing
              dynamically, and unlock powerful cross-facility analytics.
              Designed for operators who demand perfection.
            </motion.p>
            <motion.div variants={fadeInUp} className="hero-actions">
              <Link to="/register" className="btn-hero-primary">
                Start Your Free Trial <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                Login to Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <motion.div
          className="landing-stats-grid"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="stat-item">
            <div className="stat-number">10M+</div>
            <div className="stat-label">Tickets Processed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime SLA</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Enterprise Clients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">30%</div>
            <div className="stat-label">Avg. Revenue Increase</div>
          </div>
        </motion.div>
      </section>

      {/* Detail Section 1 */}
      <section className="detail-section">
        <div className="detail-row">
          <motion.div
            className="detail-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="detail-tag">
              Executive Visibility
            </motion.span>
            <motion.h2 variants={fadeInUp} className="detail-title">
              Enterprise Analytics Engine
            </motion.h2>
            <motion.p variants={fadeInUp} className="detail-text">
              Make data-driven decisions with our cross-location business
              intelligence suite. Instantly understand which locations are
              performing best and when peak hours occur.
            </motion.p>
            <motion.ul variants={fadeInUp} className="detail-list">
              <li>
                <CheckCircle2 size={20} className="detail-list-icon" /> Dynamic
                Revenue Heatmaps
              </li>
              <li>
                <CheckCircle2 size={20} className="detail-list-icon" /> Employee
                Performance Leaderboards
              </li>
              <li>
                <CheckCircle2 size={20} className="detail-list-icon" /> Peak
                Activity Trend Lines
              </li>
            </motion.ul>
          </motion.div>
          <motion.div
            className="detail-visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="visual-box">
              <div className="visual-glow"></div>
              <TrendingUp
                size={120}
                color="#3b82f6"
                style={{ margin: "0 auto", display: "block", opacity: 0.8 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Detail Section 2 */}
        <div className="detail-row reverse">
          <motion.div
            className="detail-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="detail-tag">
              Unmatched Speed
            </motion.span>
            <motion.h2 variants={fadeInUp} className="detail-title">
              Lightning-Fast Worker Terminals
            </motion.h2>
            <motion.p variants={fadeInUp} className="detail-text">
              Your on-the-ground staff needs tools that are as fast as they are.
              Our worker terminal processes entries and exits with zero latency
              via direct WebSockets.
            </motion.p>
            <motion.ul variants={fadeInUp} className="detail-list">
              <li>
                <CheckCircle2 size={20} className="detail-list-icon" /> 1-Click
                Ticket Generation
              </li>
              <li>
                <CheckCircle2 size={20} className="detail-list-icon" />{" "}
                Automated Fee Calculation
              </li>
              <li>
                <CheckCircle2 size={20} className="detail-list-icon" />{" "}
                Real-time Capacity Monitoring
              </li>
            </motion.ul>
          </motion.div>
          <motion.div
            className="detail-visual"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="visual-box"
              style={{
                background:
                  "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(88, 28, 135, 0.3))",
              }}
            >
              <div className="visual-glow"></div>
              <Zap
                size={120}
                color="#a855f7"
                style={{ margin: "0 auto", display: "block", opacity: 0.8 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="features-section">
        <motion.div
          className="features-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2>Everything you need to scale</h2>
          <p>
            Built from the ground up for massive, multi-tenant parking
            operations.
          </p>
        </motion.div>

        <motion.div
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-wrapper">
              <MapPin size={28} />
            </div>
            <h3 className="feature-title">Multi-Tenant Locations</h3>
            <p className="feature-description">
              Manage unlimited geographic zones independently from one master
              account.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-wrapper">
              <DollarSign size={28} />
            </div>
            <h3 className="feature-title">Dynamic Pricing Engine</h3>
            <p className="feature-description">
              Set unique base rates, hourly tiers, and maximums per vehicle
              category.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={28} />
            </div>
            <h3 className="feature-title">Role-Based Auth (RBAC)</h3>
            <p className="feature-description">
              Strict isolation between Super Admins, Location Managers, and
              Workers.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={28} />
            </div>
            <h3 className="feature-title">Workforce Management</h3>
            <p className="feature-description">
              Hire, assign, and track the performance of on-the-ground parking
              attendants.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={28} />
            </div>
            <h3 className="feature-title">Real-Time Sync</h3>
            <p className="feature-description">
              Live dashboard updates via WebSockets for instant visibility as
              vehicles enter and exit.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="feature-card">
            <div className="feature-icon-wrapper">
              <BarChart3 size={28} />
            </div>
            <h3 className="feature-title">Financial Reporting</h3>
            <p className="feature-description">
              Export detailed logs of revenue processing, payment status, and
              duration calculations.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Call To Action */}
      <section className="cta-section">
        <motion.div
          className="cta-box"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="cta-title">Ready to modernize your lots?</h2>
          <p className="cta-subtitle">
            Join hundreds of enterprise operators who trust ParkNova.
          </p>
          <Link
            to="/register"
            className="btn-hero-primary"
            style={{ width: "fit-content", margin: "0 auto" }}
          >
            Create Your Account <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo" style={{ fontSize: "1.2rem" }}>
          <CarFront size={20} color="#3b82f6" />
          <span>ParkNova</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ParkNova Enterprise Systems.</p>
      </footer>
    </main>
  );
};

export default Landing;
