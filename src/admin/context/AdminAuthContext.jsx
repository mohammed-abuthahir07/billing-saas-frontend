import { createContext, useContext, useState, useCallback, useMemo } from "react";

const AdminAuthContext = createContext();

const readStoredAdmin = () => {
    try {
        const token = localStorage.getItem("admin_token");
        const adminData = localStorage.getItem("admin_user");
        if (token && adminData) {
            return JSON.parse(adminData);
        }
    } catch (e) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
    }
    return null;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(readStoredAdmin);
    const [loading] = useState(false);

    const login = useCallback((token, adminData) => {
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", JSON.stringify(adminData));
        setAdmin(adminData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setAdmin(null);
    }, []);

    const value = useMemo(
        () => ({
            admin,
            loading,
            login,
            logout
        }),
        [admin, loading, login, logout]
    );

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    return useContext(AdminAuthContext);
};
