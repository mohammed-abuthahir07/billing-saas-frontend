import api from "../../services/api.js";

// ===============================
// Admin Login
// ===============================

export const adminLogin = async (adminData) => {

    const response = await api.post(
        "/admin/login",
        adminData
    );

    return response.data;

};