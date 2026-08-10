import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import "./AdminNavbar.css";
import { Link } from "react-router-dom";
import { useAdminUI } from "../context/AdminUIContext";

const AdminNavbar = () => {
   const { isMobileMenuOpen, setIsMobileMenuOpen} = useAdminUI();

    const admin = JSON.parse(
        localStorage.getItem("admin_user")
    );

    // Toggle sidebar visibility
   

    // Auto-close sidebar if screen resizes to desktop width
    
    return (
        <header className="admin-navbar">
            <div className="navbar-left">
                {/* Mobile Menu / Close Toggle Icon */}
                <button 
                    className="sidebar-toggle-btn" 
                    onClick={() => {setIsMobileMenuOpen(!isMobileMenuOpen)}} 
                    aria-label="Toggle Sidebar"
                >
                    {isMobileMenuOpen  ? <X size={24} /> : <Menu size={24} />}
                </button>

              <Link to={"/admin/dashboard"}>  <h2  style={{textDecoration:"none"}}>Billing Saas</h2></Link>
            </div>

              <Link to={"/admin/dashboard"}><div className="admin-profile">
                <div className="profile-circle">
                    {admin?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                   <h4>Administrator</h4>
                    <p>{admin?.email}</p>
                </div>
            </div></Link>
        </header>
    );
};

export default AdminNavbar;