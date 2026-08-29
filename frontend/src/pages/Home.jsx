import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import './Home.css';

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/stores';
    if (user.role === 'SYSTEM_ADMINISTRATOR') return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') return '/owner/dashboard';
    return '/stores';
  };

  return (
    <div className="home-container">
      {/* Full-width Hero with Subtle Dark Overlay & Centered Typography */}
      <section className="hero-fullwidth">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80"
          alt="Authentic local retail storefront and neighborhood cafe"
          className="hero-bg-image"
        />
        <div className="hero-overlay" />
        <div className="container hero-center-content">
          <span className="hero-eyebrow-light">STORE RATING PLATFORM</span>
          <h1 className="hero-title-light">Find stores worth your time.</h1>
          <p className="hero-description-light">
            Browse registered stores, see customer ratings, and share your own feedback.
          </p>
          <div className="hero-cta-center">
            <Link to={isAuthenticated ? getDashboardPath() : '/register'}>
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to start sharing ratings.</p>
          </div>

          <div className="steps-grid">
            <div className="step-column">
              <span className="step-number">01</span>
              <h3 className="step-title">Find a store</h3>
              <p className="step-description">Search stores by name or address.</p>
            </div>

            <div className="step-column">
              <span className="step-number">02</span>
              <h3 className="step-title">See ratings</h3>
              <p className="step-description">Check the overall customer rating.</p>
            </div>

            <div className="step-column">
              <span className="step-number">03</span>
              <h3 className="step-title">Share your experience</h3>
              <p className="step-description">Rate a store from 1 to 5.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
