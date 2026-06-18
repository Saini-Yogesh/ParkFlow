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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import "../../assets/css/Dashboard.css";
import "../../assets/css/AdminCommon.css";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b"];

const Dashboard = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchDashboardData(selectedLocation);
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      if (res.data.data && res.data.data.length > 0) {
        setLocations(res.data.data);
        setSelectedLocation(res.data.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to fetch locations");
      setLoading(false);
    }
  };

  const fetchDashboardData = async (locationId) => {
    setLoading(true);
    try {
      const [summaryRes, trendRes, typeRes] = await Promise.all([
        api.get(`/dashboard/summary?parking_location_id=${locationId}`),
        api.get(`/analytics/revenue?parking_location_id=${locationId}`),
        api.get(`/analytics/vehicle-types?parking_location_id=${locationId}`),
      ]);

      setSummary(summaryRes.data.data);
      setRevenueTrend(trendRes.data.data);
      setVehicleTypes(typeRes.data.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedLocation)
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="header-actions">
          {locations.length > 0 && (
            <select
              className="form-input"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ minWidth: "200px" }}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!locations.length ? (
        <div className="alert-info">
          You haven't created any parking locations yet. Go to the Locations tab
          to create one.
        </div>
      ) : loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {[
              {
                title: "Total Capacity",
                value: summary?.totalCapacity || 0,
                color: "#3b82f6",
              },
              {
                title: "Available Slots",
                value: summary?.availableSlots || 0,
                color: "#10b981",
              },
              {
                title: "Occupied Slots",
                value: summary?.occupiedSlots || 0,
                color: "#f59e0b",
              },
              {
                title: "Currently Inside",
                value: summary?.vehiclesCurrentlyInside || 0,
                color: "#ec4899",
              },
            ].map((stat, idx) => (
              <div
                className="stat-card"
                style={{ borderTopColor: stat.color }}
                key={idx}
              >
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="revenue-grid">
            {[
              {
                title: "Revenue Today",
                value: `$${summary?.revenueToday || 0}`,
                color: "#10b981",
              },
              {
                title: "Revenue This Week",
                value: `$${summary?.revenueThisWeek || 0}`,
                color: "#3b82f6",
              },
              {
                title: "Revenue This Month",
                value: `$${summary?.revenueThisMonth || 0}`,
                color: "#6366f1",
              },
            ].map((stat, idx) => (
              <div
                className="revenue-card"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}22, var(--bg-paper))`,
                }}
                key={idx}
              >
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Revenue Trend (Last 7 Days)</div>
              <div className="chart-container">
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
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Vehicle Distribution</div>
              <div className="chart-container">
                {vehicleTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vehicleTypes.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                        }}
                      />
                      <Legend />
                    </PieChart>
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
                    No vehicle data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
