import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import './Layouts.css';

export const AuthenticatedLayout = () => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-main">
        <div className="container layout-content">
          <Outlet />
        </div>
      </main>
      <footer className="layout-footer">
        <div className="container footer-content">
          <p className="text-meta">StoreRate Platform — Authenticated Session</p>
        </div>
      </footer>
    </div>
  );
};
