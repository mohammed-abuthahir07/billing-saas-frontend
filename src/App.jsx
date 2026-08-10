import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Bill from "./pages/Bills/Bill";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import AuthModal from "./components/AuthModal/AuthModal";
import AdminLogin from "./admin/pages/AdminLogin/AdminLogin";
import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard/AdminDashboard";
import Companies from "./admin/pages/Companies/Companies";
import CompanyDetails from "./admin/pages/CompanyDetails/CompanyDetails";
import Analytics from "./admin/pages/Analytics/Analytics";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyOTP from "./pages/ForgotPassword/VerifyOTP";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import PublicRoute from "./components/PublicRoute/PublicRoute";



  function App() {
    return (
      <>
        <BrowserRouter>
          <Routes>
            {/* Protected routes — require login */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/bills" element={<Bill />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Admin */}
            <Route path="/admin" element={
                            <AdminProtectedRoute>
                                <AdminLayout />
                            </AdminProtectedRoute> }>
                        <Route
                            path="dashboard"
                            element={<AdminDashboard />}
                        />
                        <Route 
                              path="analytics" 
                              element={<Analytics />} 
                          />
                         <Route path="companies" element={<Companies />}  />
                        <Route path="companies/:id" element={<CompanyDetails />} />
            </Route>

            {/* Public pages */}
            <Route path="/" element={<PublicRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/verify-otp" element={<VerifyOTP/>} />
            <Route path="/reset-password" element={<ResetPassword/>}/>
          </Routes>
        </BrowserRouter>
        <AuthModal />
        </>
    );
  }

  export default App;