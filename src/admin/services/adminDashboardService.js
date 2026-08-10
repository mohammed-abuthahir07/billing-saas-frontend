import adminApi from "./adminApi";

export const getAdminDashboard = async () => {

    const response = await adminApi.get("/admin/dashboard");

    return response.data;

};