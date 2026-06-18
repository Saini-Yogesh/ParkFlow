import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../assets/css/AdminCommon.css";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/users?role=WORKER");
      setWorkers(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch workers");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      setLocations(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch locations");
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchLocations();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post("/users", { ...data, role: "WORKER" });
      setOpen(false);
      reset();
      fetchWorkers();
      toast.success("Worker hired successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create worker");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Workers</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setOpen(true)}>
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
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="4">No workers found</td>
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
              <h2 className="modal-title">Hire New Worker</h2>
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
                    <label className="form-label">Password</label>
                    <input
                      className="form-input"
                      type="password"
                      required
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
                  Create Worker
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
