import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const LandingPage = lazy(() => import("../../pages/LandingPage/LandingPage"));

const PublicRoute = () => {
  const token = localStorage.getItem("billing_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="app-route-fallback" role="status" aria-live="polite">
          <div className="app-route-fallback-inner">
            <div className="app-route-spinner" />
            <span>Loading…</span>
          </div>
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  );
};

export default PublicRoute;
