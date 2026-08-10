import adminApi from "./adminApi";

// ======================================
// GET ALL COMPANIES
// ======================================

export const getCompanies = async () => {

    const response = await adminApi.get("/admin/companies");

    return response.data;

};

export const getCompany = async (id) => {

    const response = await adminApi.get(`/admin/companies/${id}`);

    return response.data;

};