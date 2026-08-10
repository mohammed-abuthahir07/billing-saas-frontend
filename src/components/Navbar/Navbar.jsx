import { useAuth } from "../../context/AuthContext";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, openLoginModal, isMobileMenuOpen, setIsMobileMenuOpen } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);



  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="navbar-logo">
          <h2> Billing SaaS</h2>
        </div>
      </div>
      
      <div className="navbar-right">
        {user ? (
          <div className="user-profile-container">
            <button className="user-profile-trigger" onClick={toggleDropdown}>
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
              <ChevronDown size={16} className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="user-dropdown animate-scale-up" onMouseLeave={() => setShowDropdown(false)}>
                <div className="dropdown-header">
                  <p className="dropdown-username">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout" 
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn animate-fade-in" onClick={openLoginModal}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
