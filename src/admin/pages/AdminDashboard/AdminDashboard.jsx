import { useEffect, useState } from "react";
import {
    Users,
    Building2,
    Receipt,
    IndianRupee,
    Wallet
} from "lucide-react";


import { getAdminDashboard } from "../../../admin/services/adminDashboardService";

import "./AdminDashboard.css";

const AdminDashboard = () => {

    const [loading, setLoading] = useState(true);

    const [dashboard, setDashboard] = useState({

        totalUsers: 0,
        totalProducts: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        monthlyRevenue: 0

    });

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const data = await getAdminDashboard();

            setDashboard({

                totalUsers: data.totalUsers,
                totalProducts: data.totalProducts,
                totalInvoices: data.totalInvoices,
                totalRevenue: data.totalRevenue,
                monthlyRevenue: data.monthlyRevenue

            });

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadDashboard();

    }, []);

    if (loading) {

        return <h2>Loading Dashboard...</h2>;

    }

    return (

        <div className="dashboard">

            <h1 className="dashboard-title">
                Admin Dashboard
            </h1>

            <div className="dashboard-cards">

                <div className="card">

                    <Users size={40} />

                    <h3>Total Users</h3>

                    <h2>{dashboard.totalUsers}</h2>

                </div>

                <div className="card">

                    <Building2 size={40} />

                    <h3>Total Products</h3>

                    <h2>{dashboard.totalProducts}</h2>

                </div>

                <div className="card">

                    <Receipt size={40} />

                    <h3>Total Invoices</h3>

                    <h2>{dashboard.totalInvoices}</h2>

                </div>

                <div className="card">

                    <IndianRupee size={40} />

                    <h3>Total Revenue</h3>

                    <h2>₹ {dashboard.totalRevenue}</h2>

                </div>

            </div>

            <div className="dashboard-bottom">

                <div className="recent-card">

                     <Wallet size={24} />

                    <h2>Monthly Revenue</h2>

                    <h1>₹ {dashboard.monthlyRevenue}</h1>

                </div>
            </div>

        </div>

    );

};

export default AdminDashboard;