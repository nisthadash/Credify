import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import Home from '../pages/Home.jsx';
import ClaimPage from '../pages/ClaimPage.jsx';
import SuccessPage from '../pages/SuccessPage.jsx';
import MyCredentialsPage from '../pages/MyCredentialsPage.jsx';
import VerifyPage from '../pages/VerifyPage.jsx';
import OrganizerLoginPage from '../pages/OrganizerLoginPage.jsx';
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/claim" element={<ClaimPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/my-credentials" element={<MyCredentialsPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/organizer/login" element={<OrganizerLoginPage />} />
      <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
