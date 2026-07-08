// src/Pages/Dashboard/MainDashboard.jsx
import React, { useState, useEffect } from 'react';
import './MainDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
// --- UPDATE: Added Filler plugin ---
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// --- UPDATE: Registered Filler plugin ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Icon Components for KPIs ---
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01v.01M12 14v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343-2-3-2m0 8c1.11 0 2.08.402 2.599 1" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const MainDashboard = () => {
    const { currentUser } = useAuth();
    const [kpiData, setKpiData] = useState({ products: 0, customers: 0, revenue: 0 });
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [timeFilter, setTimeFilter] = useState(30); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const productsRef = collection(db, 'businesses', currentUser.uid, 'products');
        const customersRef = collection(db, 'businesses', currentUser.uid, 'customers');
        const salesRef = collection(db, 'businesses', currentUser.uid, 'sales');

        const unsubProducts = onSnapshot(productsRef, snapshot => setKpiData(prev => ({ ...prev, products: snapshot.size })));
        const unsubCustomers = onSnapshot(customersRef, snapshot => setKpiData(prev => ({ ...prev, customers: snapshot.size })));

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeFilter);
        const salesQuery = query(salesRef, where('createdAt', '>=', Timestamp.fromDate(startDate)));

        const unsubSales = onSnapshot(salesQuery, (snapshot) => {
            const sales = snapshot.docs.map(doc => ({...doc.data(), createdAt: doc.data().createdAt.toDate()}));
            
            const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);
            setKpiData(prev => ({...prev, revenue: totalRevenue}));

            const salesByDay = {};
            for (let i = 0; i < timeFilter; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                salesByDay[dateString] = 0;
            }

            sales.forEach(sale => {
                const dateString = sale.createdAt.toISOString().split('T')[0];
                if (salesByDay[dateString] !== undefined) {
                    salesByDay[dateString] += sale.totalAmount;
                }
            });
            
            const sortedLabels = Object.keys(salesByDay).sort();
            const dataPoints = sortedLabels.map(label => salesByDay[label]);

            setChartData({
                labels: sortedLabels.map(l => new Date(l).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})),
                datasets: [{
                    label: 'Sales Revenue',
                    data: dataPoints,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4,
                }]
            });
            setLoading(false);
        });

        return () => {
            unsubProducts();
            unsubCustomers();
            unsubSales();
        };
    }, [currentUser, timeFilter]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    return (
        <div className="main-dashboard-container">
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon"><RevenueIcon /></div>
                    <div className="kpi-info">
                        <p>Revenue (Last {timeFilter} days)</p>
                        <span>₵{kpiData.revenue.toFixed(2)}</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><ProductIcon /></div>
                    <div className="kpi-info">
                        <p>Total Products</p>
                        <span>{kpiData.products}</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><CustomersIcon /></div>
                    <div className="kpi-info">
                        <p>Total Customers</p>
                        <span>{kpiData.customers}</span>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-header">
                    <h3>Sales Performance</h3>
                    <select value={timeFilter} onChange={(e) => setTimeFilter(Number(e.target.value))}>
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>
                </div>
                <div className="chart-container">
                    {loading ? <p>Loading chart data...</p> : <Line options={chartOptions} data={chartData} />}
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;


