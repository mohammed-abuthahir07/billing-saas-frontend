import api from "./api";

// ===============================
// Send OTP
// ===============================
export const sendOTP = async (email) => {
    const response = await api.post(
        "/forgot-password/send-otp",
        { email }
    );

    return response.data;
};

// ===============================
// Verify OTP
// ===============================
export const verifyOTP = async (email, otp) => {
    const response = await api.post(
        "/forgot-password/verify-otp",
        {
            email,
            otp,
        }
    );

    return response.data;
};

// ===============================
// Reset Password
// ===============================
export const resetPassword = async (
    email,
    otp,
    newPassword
) => {
    const response = await api.post(
        "/forgot-password/reset-password",
        {
            email,
            otp,
            newPassword,
        }
    );

    return response.data;
};