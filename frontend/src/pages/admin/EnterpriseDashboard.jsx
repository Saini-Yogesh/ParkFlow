import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import {
  Building2,
  Users,
  Receipt,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";
import "../../assets/css/Dashboard.css";
import "../../assets/css/AdminCommon.css";

const EnterpriseDashboard = () => {
  const [executive, setExecutive] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const fetchEnterpriseData = async () => {
    try {
      const execRes = await api.get("/enterprise/executive").catch((e) => {
        console.error("Executive API Error:", e.response?.data || e);
        toast.error(
          `Executive API Error: ${e.response?.data?.message || e.message}`,
        );
        return { data: { data: null } };
      });
      const trendRes = await api.get("/enterprise/revenue-trend").catch((e) => {
        console.error("Trend API Error:", e.response?.data || e);
        toast.error(
          `Trend API Error: ${e.response?.data?.message || e.message}`,
        );
        return { data: { data: [] } };
      });
      const heatRes = await api.get("/enterprise/heatmap").catch((e) => {
        console.error("Heatmap API Error:", e.response?.data || e);
        toast.error(
          `Heatmap API Error: ${e.response?.data?.message || e.message}`,
        );
        return { data: { data: [] } };
      });
      const empRes = await api.get("/enterprise/employees").catch((e) => {
        console.error("Employees API Error:", e.response?.data || e);
        toast.error(
          `Employees API Error: ${e.response?.data?.message || e.message}`,
        );
        return { data: { data: [] } };
      });

      setExecutive(execRes.data.data);
      setRevenueTrend(trendRes.data.data || []);
      setHeatmap(heatRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="dashboard-container" style={{ paddingBottom: "40px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise Analytics</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Cross-location business intelligence
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <h2
        style={{
          fontSize: "1.25rem",
          marginBottom: "16px",
          color: "var(--primary-main)",
        }}
      >
        Executive Summary
      </h2>
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTopColor: "#6366f1" }}>
          <div
            className="stat-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Building2 size={16} /> Total Locations
          </div>
          <div className="stat-value">{executive?.totalLocations || 0}</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: "#10b981" }}>
          <div
            className="stat-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Users size={16} /> Total Employees
          </div>
          <div className="stat-value">{executive?.totalEmployees || 0}</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: "#f59e0b" }}>
          <div
            className="stat-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Receipt size={16} /> Total Transactions
          </div>
          <div className="stat-value">{executive?.totalTransactions || 0}</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: "#ec4899" }}>
          <div
            className="stat-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <TrendingUp size={16} /> Rev This Month
          </div>
          <div className="stat-value">${executive?.revenueThisMonth || 0}</div>
        </div>
      </div>

      {/* AI Insights Engine (Simulated/Static for now based on actual data) */}
      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          border: "1px solid var(--primary-main)",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--primary-light)",
            marginBottom: "16px",
          }}
        >
          <BrainCircuit size={20} /> Business Insights Engine
        </h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <li
            style={{
              paddingLeft: "16px",
              borderLeft: "3px solid var(--primary-main)",
            }}
          >
            The organization generated{" "}
            <strong>${executive?.revenueToday || 0}</strong> today, tracking
            towards a strong weekly finish of ${executive?.revenueThisWeek || 0}
            .
          </li>
          <li
            style={{
              paddingLeft: "16px",
              borderLeft: "3px solid var(--success-main)",
            }}
          >
            {employees.length > 0
              ? `Employee ${employees[0].employee_name} is currently leading performance with $${employees[0].revenue_generated} in revenue.`
              : "No employee data recorded yet."}
          </li>
        </ul>
      </div>

      {/* Revenue Trend */}
      <div
        className="charts-grid"
        style={{ marginTop: "24px", gridTemplateColumns: "1fr" }}
      >
        <div className="chart-card">
          <div className="chart-title">
            Organizational Revenue Trend (30 Days)
          </div>
          <div className="chart-container">
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
              >
                No revenue trend data available (Run MV Refresh)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables for Employees & Heatmap */}
      <div
        className="charts-grid"
        style={{ marginTop: "24px", gridTemplateColumns: "1fr 1fr" }}
      >
        <div
          className="chart-card"
          style={{ height: "auto", padding: "0", overflow: "hidden" }}
        >
          <div className="chart-title" style={{ padding: "24px 24px 0 24px" }}>
            Employee Leaderboard
          </div>
          <div style={{ overflowX: "auto", padding: "0 24px 24px 24px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Tasks</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((emp, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{emp.employee_name}</td>
                    <td>{emp.tasks_processed}</td>
                    <td
                      style={{
                        color: "var(--success-main)",
                        fontWeight: "bold",
                      }}
                    >
                      ${emp.revenue_generated}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="3">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="chart-card"
          style={{ height: "auto", padding: "0", overflow: "hidden" }}
        >
          <div className="chart-title" style={{ padding: "24px 24px 0 24px" }}>
            Peak Activity Distribution
          </div>
          <div style={{ overflowX: "auto", padding: "0 24px 24px 24px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day (0=Sun)</th>
                  <th>Hour (24H)</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {heatmap.slice(0, 5).map((h, idx) => (
                  <tr key={idx}>
                    <td>Day {h.day_of_week}</td>
                    <td>{h.hour_of_day}:00</td>
                    <td>
                      <span className="badge badge-primary">
                        {h.activity_count} visits
                      </span>
                    </td>
                  </tr>
                ))}
                {heatmap.length === 0 && (
                  <tr>
                    <td colSpan="3">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
