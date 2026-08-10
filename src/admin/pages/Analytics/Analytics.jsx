import React, { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";


import {
    getUsersAnalytics,
    getRevenueAnalytics,
    getInvoiceAnalytics,
    getProductAnalytics
} from "../../services/adminAnalyticsService";


import "./Analytics.css";



const Analytics = () => {


    const [users, setUsers] = useState([]);

    const [revenue, setRevenue] = useState([]);

    const [invoices, setInvoices] = useState([]);

    const [products, setProducts] = useState([]);



    useEffect(() => {

        fetchAnalytics();

    }, []);




    const fetchAnalytics = async () => {


        try {


            const usersData = await getUsersAnalytics();

            const revenueData = await getRevenueAnalytics();

            const invoiceData = await getInvoiceAnalytics();

            const productData = await getProductAnalytics();



            setUsers(usersData);

            setRevenue(revenueData);

            setInvoices(invoiceData);

            setProducts(productData);



        } catch(error) {


            console.log(
                "Analytics Error:",
                error
            );


        }


    };




    return (

        <div className="analytics-container">


            <h1>
                Analytics Dashboard
            </h1>



            {/* Users Registration Chart */}

            <div className="chart-card">


                <h2>
                    Users Registered Per Month
                </h2>



                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <LineChart data={users}>


                        <CartesianGrid 
                            strokeDasharray="3 3"
                        />


                        <XAxis 
                            dataKey="month"
                        />


                        <YAxis />


                        <Tooltip />


                        <Line

                            type="monotone"

                            dataKey="users"

                            stroke="#2563eb"

                            strokeWidth={3}

                        />


                    </LineChart>


                </ResponsiveContainer>


            </div>





            {/* Revenue Chart */}


            <div className="chart-card">


                <h2>
                    Revenue Per Month
                </h2>



                <ResponsiveContainer
                    width="100%"
                    height={300}
                >


                    <BarChart data={revenue}>


                        <CartesianGrid
                            strokeDasharray="3 3"
                        />


                        <XAxis
                            dataKey="month"
                        />


                        <YAxis />


                        <Tooltip />


                        <Bar

                            dataKey="revenue"

                            fill="#16a34a"

                        />


                    </BarChart>


                </ResponsiveContainer>


            </div>







            {/* Invoice Chart */}



            <div className="chart-card">


                <h2>
                    Invoices Created Per Month
                </h2>



                <ResponsiveContainer
                    width="100%"
                    height={300}
                >


                    <AreaChart data={invoices}>


                        <CartesianGrid
                            strokeDasharray="3 3"
                        />


                        <XAxis
                            dataKey="month"
                        />


                        <YAxis />


                        <Tooltip />



                        <Area

                            type="monotone"

                            dataKey="invoices"

                            stroke="#dc2626"

                            fill="#fecaca"

                        />


                    </AreaChart>


                </ResponsiveContainer>


            </div>








            {/* Products Chart */}



            <div className="chart-card">


                <h2>
                    Products Added Per Month
                </h2>



                <ResponsiveContainer
                    width="100%"
                    height={300}
                >


                    <LineChart data={products}>


                        <CartesianGrid
                            strokeDasharray="3 3"
                        />


                        <XAxis
                            dataKey="month"
                        />


                        <YAxis />


                        <Tooltip />



                        <Line

                            type="monotone"

                            dataKey="products"

                            stroke="#9333ea"

                            strokeWidth={3}

                        />


                    </LineChart>


                </ResponsiveContainer>


            </div>



        </div>

    );



};


export default Analytics;