import React from "react";
import { Navigate } from "react-router-dom";
import LandingPage from "../../pages/LandingPage/LandingPage";

const PublicRoute = () => {
    const token = localStorage.getItem("billing_token");

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <LandingPage />;
};

export default PublicRoute;