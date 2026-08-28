import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import './Layouts.css';

export const PublicLayout = () => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <div className="container footer-content">
          <p className="text-meta">© 2026 StoreRate Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
