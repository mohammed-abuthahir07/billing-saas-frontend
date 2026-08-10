import { useEffect, useState, useMemo } from "react";
import {
    Search,
    Building2,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCompanies } from "../../services/adminCompanyService";
import "./Companies.css";

const Companies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await getCompanies();
            setCompanies(data.companies || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const filteredCompanies = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return companies;
        return companies.filter((company) =>
            (company.name || "").toLowerCase().includes(q) ||
            (company.email || "").toLowerCase().includes(q)
        );
    }, [search, companies]);

    if (loading) {
        return <h2>Loading Companies...</h2>;
    }

    return (
        <div className="companies">
            <div className="companies-header">
                <h1>
                    <Building2 size={30} />
                    Companies
                </h1>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search company..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>
            </div>
            <table className="companies-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Email</th>
                        <th>Products</th>
                        <th>Invoices</th>
                        <th>Monthly Revenue</th>
                        <th>Yearly Revenue</th>
                        <th>Total Revenue</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredCompanies.map((company) => (
                            <tr key={company.id}>
                                <td>{company.name}</td>
                                <td>{company.email}</td>
                                <td>{company.totalProducts}</td>
                                <td>{company.totalInvoices}</td>
                                <td>
                                    ₹ {Number(company.monthlyRevenue).toLocaleString()}
                                </td>
                                <td>
                                    ₹ {Number(company.yearlyRevenue).toLocaleString()}
                                </td>
                                <td>
                                    ₹ {Number(company.totalRevenue).toLocaleString()}
                                </td>
                                <td>
                                <button
                                    className="view-btn"
                                    onClick={() => navigate(`/admin/companies/${company.id}`)}
                                >
                                    <Eye size={18} />
                                    View
                                </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );

};

export default Companies;