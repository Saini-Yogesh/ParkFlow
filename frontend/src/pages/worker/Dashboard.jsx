import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import { LogOut, CarFront, KeyRound, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import "../../assets/css/Dashboard.css";
import "../../assets/css/AdminCommon.css";

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCapacity: 0,
    availableSlots: 0,
    locationName: "",
  });
  const [slots, setSlots] = useState([]);

  // Entry Form
  const {
    register: registerEntry,
    handleSubmit: handleEntry,
    reset: resetEntry,
    watch: watchEntry,
  } = useForm({ defaultValues: { vehicle_category: "CAR" } });
  const selectedCategory = watchEntry("vehicle_category");
  const [entryLoading, setEntryLoading] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);

  // Exit Form
  const [ticketId, setTicketId] = useState("");
  const [exitSession, setExitSession] = useState(null);
  const [exitLoading, setExitLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSlots();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lastTicket) setLastTicket(null);
        if (exitSession) {
          setExitSession(null);
          setTicketId("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastTicket, exitSession]);

  const fetchSlots = async () => {
    try {
      const res = await api.get(
        `/slots?parking_location_id=${user.parking_location_id}`,
      );
      setSlots(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch parking slots");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(
        `/dashboard/summary?parking_location_id=${user.parking_location_id}`,
      );
      setStats(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard metrics");
    }
  };

  const onEntry = async (data) => {
    setEntryLoading(true);
    try {
      const payload = {
        vehicle_number: data.license_plate,
        vehicle_category: data.vehicle_category,
        parking_location_id: user.parking_location_id,
      };
      const res = await api.post("/sessions/entry", payload);
      setLastTicket(res.data.data);
      resetEntry();
      fetchStats(); // Update available slots automatically
      fetchSlots(); // Update grid
      toast.success("Ticket generated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Entry failed");
    } finally {
      setEntryLoading(false);
    }
  };

  const handleFetchExit = async () => {
    if (!ticketId) return;
    setExitLoading(true);
    try {
      const res = await api.post("/sessions/exit", {
        identifier: ticketId,
        payment_method: "CASH",
      });
      setExitSession(res.data.data);
      setTicketId(""); // Clear input immediately
      toast.success("Exit processed automatically!");
      fetchStats(); // Update available slots automatically after a car leaves
      fetchSlots(); // Update grid
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid Ticket ID or already exited",
      );
      setExitSession(null);
    } finally {
      setExitLoading(false);
    }
  };

  const handleClearExit = () => {
    setExitSession(null);
    setTicketId("");
  };
  const frontendToDb = { CAR: "MEDIUM", BIKE: "LIGHT", TRUCK: "HEAVY" };
  const selectedDbCategory = frontendToDb[selectedCategory];
  const availableForSelectedCategory = slots.filter(
    (s) =>
      s.status === "AVAILABLE" &&
      s.vehicle_categories?.code === selectedDbCategory,
  ).length;

  const availableBikes = slots.filter(
    (s) => s.status === "AVAILABLE" && s.vehicle_categories?.code === "LIGHT",
  ).length;
  const availableCars = slots.filter(
    (s) => s.status === "AVAILABLE" && s.vehicle_categories?.code === "MEDIUM",
  ).length;
  const availableTrucks = slots.filter(
    (s) => s.status === "AVAILABLE" && s.vehicle_categories?.code === "HEAVY",
  ).length;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header className="admin-header">
        <div className="header-title" style={{ color: "var(--primary-main)" }}>
          ParkFlow Worker Terminal
        </div>
        <div
          className="header-actions"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <span>{user.name}</span>
          <button
            className="btn-secondary"
            style={{ padding: "8px" }}
            onClick={() => setPasswordModalOpen(true)}
            title="Change Password"
          >
            <KeyRound size={20} />
          </button>
          <button
            className="btn-secondary"
            style={{ padding: "8px" }}
            onClick={logout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main
        className="admin-content"
        style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}
      >
        <div className="page-header" style={{ marginTop: "24px" }}>
          <div>
            <h1 className="page-title">Worker Dashboard</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {stats.locationName || "Loading..."}
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-secondary"
              style={{
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={fetchStats}
              title="Refresh Stats"
            >
              <RefreshCw size={18} />
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                border: "1px solid var(--primary-main)",
                color: "var(--primary-main)",
                borderRadius: "20px",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <CarFront size={16} />
              Total Capacity: {stats.totalCapacity}
            </span>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    availableBikes > 0
                      ? "rgba(16, 185, 129, 0.1)"
                      : "var(--error-bg)",
                  color:
                    availableBikes > 0
                      ? "var(--success-main)"
                      : "var(--error-main)",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: `1px solid ${availableBikes > 0 ? "var(--success-main)" : "var(--error-main)"}`,
                }}
              >
                BIKES: {availableBikes}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    availableCars > 0
                      ? "rgba(59, 130, 246, 0.1)"
                      : "var(--error-bg)",
                  color:
                    availableCars > 0
                      ? "var(--primary-main)"
                      : "var(--error-main)",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: `1px solid ${availableCars > 0 ? "var(--primary-main)" : "var(--error-main)"}`,
                }}
              >
                CARS: {availableCars}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    availableTrucks > 0
                      ? "rgba(245, 158, 11, 0.1)"
                      : "var(--error-bg)",
                  color:
                    availableTrucks > 0
                      ? "var(--warning-main)"
                      : "var(--error-main)",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: `1px solid ${availableTrucks > 0 ? "var(--warning-main)" : "var(--error-main)"}`,
                }}
              >
                TRUCKS: {availableTrucks}
              </span>
            </div>
          </div>
        </div>

        <div className="worker-panels">
          {/* Entry Panel */}
          <div className="worker-panel">
            <h2 className="panel-title entry">Vehicle Entry</h2>
            <form onSubmit={handleEntry(onEntry)}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">License Plate</label>
                <input
                  className="form-input"
                  required
                  style={{
                    textTransform: "uppercase",
                    fontSize: "1.2rem",
                    letterSpacing: "2px",
                  }}
                  {...registerEntry("license_plate")}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label">Vehicle Category</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {["BIKE", "CAR", "TRUCK"].map((cat) => (
                    <label
                      key={cat}
                      style={{ cursor: "pointer", display: "block" }}
                    >
                      <input
                        type="radio"
                        value={cat}
                        {...registerEntry("vehicle_category")}
                        style={{ display: "none" }}
                      />
                      <div
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          borderRadius: "8px",
                          border: `2px solid ${selectedCategory === cat ? "var(--primary-main)" : "var(--border-color)"}`,
                          backgroundColor:
                            selectedCategory === cat
                              ? "rgba(59, 130, 246, 0.1)"
                              : "var(--bg-secondary)",
                          color:
                            selectedCategory === cat
                              ? "var(--primary-main)"
                              : "var(--text-primary)",
                          fontWeight:
                            selectedCategory === cat ? "bold" : "normal",
                          transition: "all 0.2s",
                        }}
                      >
                        {cat}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
                disabled={entryLoading || availableForSelectedCategory === 0}
              >
                {entryLoading
                  ? "Processing..."
                  : `Generate Ticket & Open Barrier (${availableForSelectedCategory} Available)`}
              </button>
            </form>
          </div>

          {/* Exit Panel */}
          <div className="worker-panel">
            <h2 className="panel-title exit">Vehicle Exit</h2>
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <input
                className="form-input"
                style={{ flexGrow: 1 }}
                placeholder="Enter Ticket ID or License Plate"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
              />
              <button
                className="btn-secondary"
                style={{
                  border: "1px solid var(--secondary-main)",
                  color: "var(--secondary-main)",
                }}
                onClick={handleFetchExit}
                disabled={!ticketId || exitLoading}
              >
                {exitLoading ? "Scanning..." : "Process"}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Slot Grid */}
        <div style={{ marginTop: "32px" }}>
          <h2
            className="page-title"
            style={{ fontSize: "1.5rem", marginBottom: "24px" }}
          >
            Live Parking Grid
          </h2>

          {["LIGHT", "MEDIUM", "HEAVY"].map((categoryCode) => {
            const groupSlots = slots.filter(
              (s) => s.vehicle_categories?.code === categoryCode,
            );
            if (groupSlots.length === 0) return null;

            const dbToFrontend = {
              MEDIUM: "CAR",
              LIGHT: "BIKE",
              HEAVY: "TRUCK",
            };
            const categoryLabel = dbToFrontend[categoryCode];
            const titleMap = {
              LIGHT: "Bikes",
              MEDIUM: "Cars",
              HEAVY: "Trucks",
            };

            return (
              <div key={categoryCode} style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{titleMap[categoryCode]} Zone</span>
                  <span
                    style={{ color: "var(--success-main)", fontWeight: "bold" }}
                  >
                    {groupSlots.filter((s) => s.status === "AVAILABLE").length}{" "}
                    Available
                  </span>
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {groupSlots.map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        backgroundColor:
                          slot.status === "AVAILABLE"
                            ? "var(--success-bg)"
                            : "var(--error-bg)",
                        border: `1px solid ${slot.status === "AVAILABLE" ? "var(--success-main)" : "var(--error-main)"}`,
                        borderRadius: "8px",
                        padding: "16px",
                        minHeight: "140px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color:
                            slot.status === "AVAILABLE"
                              ? "var(--success-main)"
                              : "var(--error-main)",
                        }}
                      >
                        {slot.slot_number}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          marginTop: "4px",
                          fontWeight: 600,
                          color:
                            slot.status === "AVAILABLE"
                              ? "var(--success-main)"
                              : "var(--error-main)",
                          opacity: 0.9,
                        }}
                      >
                        {categoryLabel}
                      </div>
                      {slot.status === "OCCUPIED" && slot.active_ticket && (
                        <div
                          style={{
                            marginTop: "12px",
                            fontSize: "0.85rem",
                            color: "var(--error-main)",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "rgba(239,68,68,0.1)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            ID: <strong>{slot.active_ticket}</strong>
                          </div>
                          <div
                            style={{ fontWeight: "bold", letterSpacing: "1px" }}
                          >
                            {slot.active_plate}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

      {/* Entry Summary Small Modal */}
      {lastTicket && (
        <div
          className="modal-overlay"
          onClick={() => setLastTicket(null)}
          style={{
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "320px",
              width: "90%",
              padding: "24px",
              textAlign: "center",
              position: "relative",
              borderRadius: "12px",
            }}
          >
            <div style={{ color: "var(--primary-main)", marginBottom: "12px" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: "0 auto" }}
              >
                <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>

            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: "20px",
                color: "var(--text-primary)",
              }}
            >
              Entry Successful
            </h2>

            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
                border: "1px solid #3b82f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Ticket ID:
                </span>
                <strong
                  style={{ fontSize: "1rem", color: "var(--primary-main)" }}
                >
                  {lastTicket.ticket_number}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Slot:
                </span>
                <strong style={{ fontSize: "1rem" }}>
                  {lastTicket.parking_slots?.slot_number}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Plate:
                </span>
                <strong style={{ fontSize: "1rem" }}>
                  {lastTicket.vehicle_number}
                </strong>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "10px",
                fontSize: "1rem",
              }}
              onClick={() => setLastTicket(null)}
            >
              Print & Close
            </button>
          </div>
        </div>
      )}

      {/* Exit Summary Small Modal */}
      {exitSession && (
        <div
          className="modal-overlay"
          onClick={handleClearExit}
          style={{
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "320px",
              width: "90%",
              padding: "24px",
              textAlign: "center",
              position: "relative",
              borderRadius: "12px",
            }}
          >
            <div
              style={{ color: "var(--secondary-main)", marginBottom: "12px" }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: "0 auto" }}
              >
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>

            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: "20px",
                color: "var(--text-primary)",
              }}
            >
              Exit Successful
            </h2>

            <div
              style={{
                backgroundColor: "rgba(236, 72, 153, 0.1)",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
                border: "1px solid #ec4899",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Plate:
                </span>
                <strong style={{ fontSize: "1rem" }}>
                  {exitSession.vehicle_number}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Duration:
                </span>
                <strong style={{ fontSize: "1rem" }}>
                  {(exitSession.duration_minutes / 60).toFixed(1)} hrs
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(236, 72, 153, 0.3)",
                  paddingTop: "12px",
                  marginTop: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Amount Due:
                </span>
                <strong
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--secondary-main)",
                    lineHeight: 1,
                  }}
                >
                  ${exitSession.total_amount}
                </strong>
              </div>
            </div>

            <button
              className="btn-secondary"
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "10px",
                fontSize: "1rem",
              }}
              onClick={handleClearExit}
            >
              Done / Ready
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
