import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Save,
  X,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getProfile, updateProfile, uploadProfileImage } from "../../services/profileService";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // User Table
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // user_profiles Table
  const [companyName, setCompanyName] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();

      // users table
      setName(data.user?.name || "");
      setEmail(data.user?.email || "");

      // user_profiles table
      setCompanyName(data.profile?.company_name || "");
      setMobile(data.profile?.mobile || "");
      setAlternateEmail(data.profile?.alternate_email || "");
      setGstNumber(data.profile?.gst_number || "");
      setWebsite(data.profile?.website || "");
      setAddress(data.profile?.address || "");
      setCity(data.profile?.city || "");
      setState(data.profile?.state || "");
      setCountry(data.profile?.country || "");
      setPincode(data.profile?.pincode || "");
      setProfileImage(data.profile?.profile_image || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const response = await updateProfile({
        name,
        email,
        company_name: companyName,
        mobile,
        alternate_email: alternateEmail,
        gst_number: gstNumber,
        address,
        city,
        state,
        country,
        pincode,
        website,
        profile_image: profileImage,
      });

      // Update User State
      setName(response.user.name);
      setEmail(response.user.email);

      // Update Profile State
      setCompanyName(response.profile?.company_name || "");
      setMobile(response.profile?.mobile || "");
      setAlternateEmail(response.profile?.alternate_email || "");
      setGstNumber(response.profile?.gst_number || "");
      setAddress(response.profile?.address || "");
      setCity(response.profile?.city || "");
      setState(response.profile?.state || "");
      setCountry(response.profile?.country || "");
      setPincode(response.profile?.pincode || "");
      setWebsite(response.profile?.website || "");
      setProfileImage(response.profile?.profile_image || "");

      // Update Local Storage
      const oldUser = JSON.parse(localStorage.getItem("billing_user")) || {};
      localStorage.setItem(
        "billing_user",
        JSON.stringify({
          ...oldUser,
          ...response.user,
        })
      );

      // 1. Show the success notification message
      setSuccess(response.message || "Profile updated successfully!");

      // 2. Wait for 2000ms (2 seconds) before navigating to the dashboard
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile."
      );
    } 
    finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploading(true);

      const data = await uploadProfileImage(file);

      // Adjust key depending on backend response (e.g. data.profile_image or data.image)
      const imageUrl = data.profile_image || data.image;

      setProfileImage(
        `http://localhost:5000${imageUrl}`
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Image upload failed"
      );

    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 size={40} className="spin-icon" />
        <p>Fetching profile details...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Top-Right X Button to Exit */}
        <button
          type="button"
          className="close-profile-btn"
          onClick={() => navigate("/")}
          title="Back to Dashboard"
          aria-label="Close Profile"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="profile-header">
          <div className="header-text">
            <h2>Profile Management</h2>
            <p>Update your personal and business details below.</p>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="alert-box success-box">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert-box error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Avatar / Profile Image Section */}
          <div className="profile-image-section">
            <div className="avatar-wrapper">
              <img
                src={
                  profileImage
                    ? profileImage
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profile Avatar"
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <div
                className="avatar-badge"
                onClick={() => fileInputRef.current.click()}
                style={{ cursor: "pointer" }}
              >
                {uploading ? (
                  <Loader2 size={14} className="spin-icon" />
                ) : (
                  <Camera size={14} />
                )}
              </div>
            </div>
            <div className="avatar-info">
              <h4>{name || "User Profile"}</h4>
              <p>{email || "No email attached"}</p>
            </div>
          </div>

          <div className="form-section-title">Account Credentials</div>

          {/* Grid Layout for Forms */}
          <div className="form-grid">
            {/* Name */}
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section-title">Business & Contact Info</div>

          <div className="form-grid">
            {/* Company */}
            <div className="form-group">
              <label>Company Name</label>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="input-box">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>

            {/* Alternate Email */}
            <div className="form-group">
              <label>Alternate Email</label>
              <div className="input-box">
                <input
                  type="email"
                  placeholder="billing@company.com"
                  value={alternateEmail}
                  onChange={(e) => setAlternateEmail(e.target.value)}
                />
              </div>
            </div>

            {/* GST */}
            <div className="form-group">
              <label>GST Number</label>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Website */}
            <div className="form-group span-2">
              <label>Website URL</label>
              <div className="input-box">
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section-title">Address & Location</div>

          {/* Address Textarea */}
          <div className="form-group">
            <label>Street Address</label>
            <div className="input-box textarea-box">
              <textarea
                rows="2"
                placeholder="Suite / Floor, Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* City, State, Country, Pincode Quad Grid */}
          <div className="form-grid quad-grid">
            <div className="form-group">
              <label>City</label>
              <div className="input-box simple-input">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>State</label>
              <div className="input-box simple-input">
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Country</label>
              <div className="input-box simple-input">
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <div className="input-box simple-input">
                <input
                  type="text"
                  placeholder="600001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Actions Bar */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;