import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../assets/css/AdminCommon.css";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState("");
  const [open, setOpen] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchWorkers = async (locId) => {
    try {
      const res = await api.get(locId ? `/users?role=WORKER&parking_location_id=${locId}` : "/users?role=WORKER");
      setWorkers(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch workers");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      setLocations(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedLoc(res.data.data[0].id);
      }
    } catch (err) {
      toast.error("Failed to fetch locations");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLoc) fetchWorkers(selectedLoc);
  }, [selectedLoc]);

  const onSubmit = async (data) => {
    try {
      if (editWorker) {
        // If password is empty, don't send it so it doesn't get updated
        const payload = { ...data, role: "WORKER" };
        if (!payload.password) delete payload.password;
        await api.patch(`/users/${editWorker.id}`, payload);
        toast.success("Worker updated successfully!");
      } else {
        await api.post("/users", { ...data, role: "WORKER" });
        toast.success("Worker hired successfully!");
      }
      setOpen(false);
      setEditWorker(null);
      reset({ name: "", email: "", password: "", phone: "", parking_location_id: selectedLoc });
      fetchWorkers(selectedLoc);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save worker");
    }
  };

  const handleStatusToggle = async (worker) => {
    const newStatus = worker.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this worker?`)) return;
    try {
      await api.put(`/users/${worker.id}/status`, { status: newStatus });
      toast.success(`Worker ${newStatus.toLowerCase()} successfully`);
      fetchWorkers(selectedLoc);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update worker status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to fire this worker?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Worker deleted successfully");
      fetchWorkers(selectedLoc);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete worker");
    }
  };

  const openEditModal = (worker) => {
    setEditWorker(worker);
    reset({
      name: worker.name,
      email: worker.email,
      phone: worker.phone || "",
      password: "", // empty for edit
      parking_location_id: worker.parking_workers?.[0]?.parking_locations?.id || selectedLoc,
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Workers</h1>
        <div className="header-actions">
          {locations.length > 0 && (
            <select
              className="form-input"
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              style={{ minWidth: "200px" }}
            >
              <option value="" disabled>Select Location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
          <button
            className="btn-primary"
            disabled={!selectedLoc}
            onClick={() => {
              setEditWorker(null);
              reset({ name: "", email: "", password: "", phone: "", parking_location_id: selectedLoc });
              setOpen(true);
            }}
          >
            Hire Worker
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">No workers found</td>
              </tr>
            ) : (
              workers.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>{row.email}</td>
                  <td>
                    <span className="badge badge-secondary">
                      {row.parking_workers?.[0]?.parking_locations?.name ||
                        "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${row.status === "ACTIVE" ? "badge-success" : "badge-error"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn-secondary"
                        onClick={() => openEditModal(row)}
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleStatusToggle(row)}
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem", color: row.status === "ACTIVE" ? "#eab308" : "#22c55e", borderColor: row.status === "ACTIVE" ? "#eab308" : "#22c55e" }}
                      >
                        {row.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleDelete(row.id)}
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem", color: "#ef4444", borderColor: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editWorker ? "Edit Worker" : "Hire New Worker"}</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-grid single">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      className="form-input"
                      required
                      {...register("name")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      required
                      {...register("email")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Password {editWorker && "(Leave blank to keep current)"}
                    </label>
                    <input
                      className="form-input"
                      type="password"
                      required={!editWorker}
                      {...register("password")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" {...register("phone")} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Location</label>
                    <select
                      className="form-input"
                      required
                      defaultValue=""
                      {...register("parking_location_id")}
                    >
                      <option value="" disabled>
                        Select Location
                      </option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editWorker ? "Save Changes" : "Create Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
