import adminApi from "./adminApi";


// Users Analytics
export const getUsersAnalytics = async()=>{

    const response = await adminApi.get(
        "/admin/analytics/users"
    );

    return response.data;

};


// Revenue Analytics
export const getRevenueAnalytics = async()=>{

    const response = await adminApi.get(
        "/admin/analytics/revenue"
    );

    return response.data;

};


// Invoice Analytics
export const getInvoiceAnalytics = async()=>{

    const response = await adminApi.get(
        "/admin/analytics/invoices"
    );

    return response.data;

};


// Product Analytics
export const getProductAnalytics = async()=>{

    const response = await adminApi.get(
        "/admin/analytics/products"
    );

    return response.data;

};