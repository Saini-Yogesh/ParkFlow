import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import { io } from "socket.io-client";
import { LogOut, CarFront, KeyRound } from "lucide-react";
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
  const [socket, setSocket] = useState(null);

  // Entry Form
  const {
    register: registerEntry,
    handleSubmit: handleEntry,
    reset: resetEntry,
  } = useForm();
  const [entryLoading, setEntryLoading] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);

  // Exit Form
  const [ticketId, setTicketId] = useState("");
  const [exitSession, setExitSession] = useState(null);
  const [exitLoading, setExitLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();

    // Connect Socket.io
    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
    );
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Socket connected"));

    newSocket.on("slot-updated", (data) => {
      // Re-fetch stats on slot updates
      fetchStats();
    });

    return () => newSocket.close();
  }, []);

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
      const res = await api.post("/sessions/entry", data);
      setLastTicket(res.data.data);
      resetEntry();
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
      const res = await api.post("/sessions/exit", { ticket_id: ticketId });
      setExitSession(res.data.data);
      toast.success("Ticket found!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid Ticket ID or already exited",
      );
      setExitSession(null);
    } finally {
      setExitLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    alert(`Payment of $${exitSession.amount_due} received. Barrier opening...`);
    setExitSession(null);
    setTicketId("");
  };

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
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid var(--primary-main)",
                color: "var(--primary-main)",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              <CarFront size={18} />
              Capacity: {stats.totalCapacity}
            </span>
            <span
              style={{
                padding: "8px 16px",
                backgroundColor:
                  stats.availableSlots > 0
                    ? "var(--success-bg)"
                    : "var(--error-bg)",
                color:
                  stats.availableSlots > 0
                    ? "var(--success-main)"
                    : "var(--error-main)",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              {stats.availableSlots} Available
            </span>
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
                <select
                  className="form-input"
                  required
                  defaultValue="CAR"
                  {...registerEntry("vehicle_category")}
                >
                  <option value="CAR">CAR</option>
                  <option value="BIKE">BIKE</option>
                  <option value="TRUCK">TRUCK</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
                disabled={entryLoading || stats.availableSlots === 0}
              >
                {entryLoading
                  ? "Processing..."
                  : "Generate Ticket & Open Barrier"}
              </button>
            </form>

            {lastTicket && (
              <div className="success-box">
                <div className="success-title">Entry Successful</div>
                <div className="success-text">
                  <strong>Ticket ID:</strong> {lastTicket.ticket_id}
                </div>
                <div className="success-text">
                  <strong>Assigned Slot:</strong> {lastTicket.slot_number}
                </div>
                <div className="success-text">
                  <strong>Plate:</strong> {lastTicket.license_plate}
                </div>
              </div>
            )}
          </div>

          {/* Exit Panel */}
          <div className="worker-panel">
            <h2 className="panel-title exit">Vehicle Exit</h2>
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <input
                className="form-input"
                style={{ flexGrow: 1 }}
                placeholder="Scan or Enter Ticket ID"
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
                {exitLoading ? "Scanning..." : "Scan"}
              </button>
            </div>

            {exitSession && (
              <div
                style={{
                  marginTop: "40px",
                  padding: "24px",
                  backgroundColor: "rgba(236, 72, 153, 0.1)",
                  border: "1px solid #ec4899",
                  borderRadius: "8px",
                }}
              >
                <h3
                  style={{ marginBottom: "24px", color: "var(--text-primary)" }}
                >
                  Exit Summary
                </h3>
                <div className="form-grid">
                  <div>
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      License Plate
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {exitSession.license_plate}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      Duration
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {exitSession.duration_hours} hrs
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      Amount Due
                    </div>
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "var(--secondary-main)",
                      }}
                    >
                      ${exitSession.amount_due}
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: "100%",
                    marginTop: "32px",
                    padding: "16px",
                    fontSize: "1.1rem",
                    backgroundColor: "var(--secondary-main)",
                  }}
                  onClick={handleProcessPayment}
                >
                  Process Payment & Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};

export default WorkerDashboard;
