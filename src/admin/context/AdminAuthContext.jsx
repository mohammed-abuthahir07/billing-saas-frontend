import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("admin_token");
        const adminData = localStorage.getItem("admin_user");

        if (token && adminData) {
            setAdmin(JSON.parse(adminData));
        }

        setLoading(false);

    }, []);

    const login = (token, adminData) => {

        localStorage.setItem("admin_token", token);

        localStorage.setItem(
            "admin_user",
            JSON.stringify(adminData)
        );

        setAdmin(adminData);

    };

    const logout = () => {

        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");

        setAdmin(null);

    };

    return (

        <AdminAuthContext.Provider
            value={{
                admin,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AdminAuthContext.Provider>

    );

};

export const useAdminAuth = () => {
    return useContext(AdminAuthContext);
};