// src/Pages/Dashboard/MainDashboard.jsx
import React, { useState, useEffect } from 'react';
import './MainDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Icon Components for KPIs ---
const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01v.01M12 14v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343-2-3-2m0 8c1.11 0 2.08.402 2.599 1" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>;
const ProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const MainDashboard = () => {
    const { currentUser } = useAuth();
    const [kpiData, setKpiData] = useState({ revenue: 0, expenses: 0, profit: 0, customers: 0 });
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [timeFilter, setTimeFilter] = useState(30); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);

        const customersRef = collection(db, 'businesses', currentUser.uid, 'customers');
        const salesRef = collection(db, 'businesses', currentUser.uid, 'sales');
        const expensesRef = collection(db, 'businesses', currentUser.uid, 'expenses');

        const unsubCustomers = onSnapshot(customersRef, snapshot => {
            setKpiData(prev => ({ ...prev, customers: snapshot.size }));
        });

        // Set up dates for queries
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeFilter);
        const startDateString = startDate.toISOString().split('T')[0]; // For expenses (YYYY-MM-DD)

        const salesQuery = query(salesRef, where('createdAt', '>=', Timestamp.fromDate(startDate)));
        const expensesQuery = query(expensesRef, where('date', '>=', startDateString));

        // Listen to both Sales and Expenses to build the Profit Chart
        const unsubSales = onSnapshot(salesQuery, (salesSnapshot) => {
            const unsubExpenses = onSnapshot(expensesQuery, (expensesSnapshot) => {
                
                const sales = salesSnapshot.docs.map(doc => ({...doc.data(), createdAt: doc.data().createdAt.toDate()}));
                const expenses = expensesSnapshot.docs.map(doc => doc.data());
                
                const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);
                const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
                const netProfit = totalRevenue - totalExpenses;

                setKpiData(prev => ({...prev, revenue: totalRevenue, expenses: totalExpenses, profit: netProfit}));

                // Build daily chart data array
                const dataByDay = {};
                for (let i = 0; i < timeFilter; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - (timeFilter - 1) + i); // Go from oldest to newest
                    const dateString = date.toISOString().split('T')[0];
                    dataByDay[dateString] = { revenue: 0, expenses: 0 };
                }

                sales.forEach(sale => {
                    const dateString = sale.createdAt.toISOString().split('T')[0];
                    if (dataByDay[dateString] !== undefined) dataByDay[dateString].revenue += sale.totalAmount;
                });

                expenses.forEach(exp => {
                    const dateString = exp.date; // already YYYY-MM-DD
                    if (dataByDay[dateString] !== undefined) dataByDay[dateString].expenses += exp.amount;
                });
                
                const sortedLabels = Object.keys(dataByDay).sort();
                const revenuePoints = sortedLabels.map(label => dataByDay[label].revenue);
                const expensePoints = sortedLabels.map(label => dataByDay[label].expenses);
                const profitPoints = sortedLabels.map(label => dataByDay[label].revenue - dataByDay[label].expenses);

                setChartData({
                    labels: sortedLabels.map(l => new Date(l).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})),
                    datasets: [
                        {
                            label: 'Net Profit',
                            data: profitPoints,
                            borderColor: '#3b82f6', // Blue
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            order: 1
                        },
                        {
                            label: 'Revenue',
                            data: revenuePoints,
                            borderColor: '#10b981', // Green
                            backgroundColor: 'transparent',
                            borderDash: [5, 5],
                            tension: 0.4,
                            borderWidth: 2,
                            order: 2
                        },
                        {
                            label: 'Expenses',
                            data: expensePoints,
                            borderColor: '#ef4444', // Red
                            backgroundColor: 'transparent',
                            borderDash: [5, 5],
                            tension: 0.4,
                            borderWidth: 2,
                            order: 3
                        }
                    ]
                });
                setLoading(false);
            });
            return () => unsubExpenses(); // Cleanup inner listener
        });

        return () => {
            unsubCustomers();
            unsubSales();
        };
    }, [currentUser, timeFilter]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } 
        },
        scales: { 
            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
            x: { grid: { display: false } }
        },
        interaction: { mode: 'index', intersect: false } // Shows tooltip for all 3 lines at once
    };

    return (
        <div className="main-dashboard-container">
            <div className="chart-header" style={{marginBottom: '1.5rem'}}>
                <h3>Business Overview</h3>
                <select value={timeFilter} onChange={(e) => setTimeFilter(Number(e.target.value))}>
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 90 Days</option>
                </select>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card profit-card">
                    <div className="kpi-icon"><ProfitIcon /></div>
                    <div className="kpi-info">
                        <p>Net Profit</p>
                        <span className={kpiData.profit >= 0 ? 'positive' : 'negative'}>
                            ₵{kpiData.profit.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{color: '#10b981', backgroundColor: '#d1fae5'}}><RevenueIcon /></div>
                    <div className="kpi-info">
                        <p>Total Revenue</p>
                        <span>₵{kpiData.revenue.toFixed(2)}</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{color: '#ef4444', backgroundColor: '#fee2e2'}}><ExpenseIcon /></div>
                    <div className="kpi-info">
                        <p>Total Expenses</p>
                        <span>₵{kpiData.expenses.toFixed(2)}</span>
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
                <div className="chart-container">
                    {loading ? <p>Loading analytics...</p> : <Line options={chartOptions} data={chartData} />}
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;
