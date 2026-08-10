import { createContext, useContext, useState } from "react";

const AdminUIContext = createContext();

export const AdminUIProvider = ({ children }) => {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <AdminUIContext.Provider
            value={{
                isMobileMenuOpen,
                setIsMobileMenuOpen
            }}
        >
            {children}
        </AdminUIContext.Provider>
    );
};

export const useAdminUI = () => {
    return useContext(AdminUIContext);
};