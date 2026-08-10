import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Building2,
    Mail,
    Package,
    Receipt,
    IndianRupee,
    Calendar
} from "lucide-react";
import { getCompany } from "../../services/adminCompanyService";
import "./CompanyDetails.css";


const CompanyDetails = () => {

    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);

    const loadCompany = async () => {
        try {
            setLoading(true);
            const data = await getCompany(id);
            setCompany(data.company);
            setRecentInvoices(data.recentInvoices);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadCompany();
    }, [id]);
    if (loading) {
        return <h2>Loading...</h2>;
    }
    return (

        <div className="company-details">
            <h1 className="page-title">
                Company Details
            </h1>
            <div className="company-card">
                <div className="company-header">
                    <div className="company-avatar">
                        <Building2 size={45} />
                    </div>
                    <div>
                        <h2>{company.name}</h2>
                        <p>
                            <Mail size={16} />
                            {company.email}
                        </p>
                    </div>
                </div>
            </div>
            <div className="stats-grid">
                <div className="stat-card">
                    <Package size={35} />
                    <h3>Total Products</h3>
                    <h2>{company.totalProducts}</h2>
                </div>
                <div className="stat-card">
                    <Receipt size={35} />
                    <h3>Total Invoices</h3>
                    <h2>{company.totalInvoices}</h2>
                </div>
                <div className="stat-card">
                    <Calendar size={35} />
                    <h3>Monthly Revenue</h3>
                    <h2>
                        ₹ {Number(company.monthlyRevenue).toLocaleString()}
                    </h2>
                </div>
                <div className="stat-card">
                    <IndianRupee size={35} />
                    <h3>Total Revenue</h3>
                    <h2>
                        ₹ {Number(company.totalRevenue).toLocaleString()}
                    </h2>
                </div>
            </div>
            <div className="invoice-section">
                <h2>
                    Recent Invoices
                </h2>
                <table>
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            recentInvoices.length > 0 ?
                                recentInvoices.map((invoice) => (
                                    <tr key={invoice.invoice_number}>
                                        <td>
                                            {invoice.invoice_number}
                                        </td>
                                        <td>
                                            {invoice.customer_name}
                                        </td>
                                        <td>
                                            ₹ {Number(invoice.grand_total).toLocaleString()}
                                        </td>
                                        <td>
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4">
                                            No invoices found.
                                        </td>
                                    </tr>
                                )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default CompanyDetails;