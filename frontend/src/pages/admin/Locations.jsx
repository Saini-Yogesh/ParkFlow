import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../assets/css/AdminCommon.css";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchLocations = async () => {
    try {
      const res = await api.get("/locations");
      setLocations(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch locations");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post("/locations", data);
      setOpen(false);
      reset();
      fetchLocations();
      toast.success("Location added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create location");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parking Locations</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Add Location
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>City</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="4">No locations found</td>
              </tr>
            ) : (
              locations.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="badge badge-primary">{row.code}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>
                    {row.city}, {row.country}
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
              <h2 className="modal-title">Add New Location</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Location Name</label>
                    <input
                      className="form-input"
                      required
                      {...register("name")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Location Code (e.g. LOC-01)
                    </label>
                    <input
                      className="form-input"
                      required
                      {...register("code")}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Address</label>
                    <input
                      className="form-input"
                      required
                      {...register("address")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      className="form-input"
                      required
                      {...register("city")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      className="form-input"
                      required
                      defaultValue="USA"
                      {...register("country")}
                    />
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
                  Create Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
