import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../assets/css/AdminCommon.css";

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState("");
  const { register, handleSubmit, reset } = useForm();

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

  const fetchSlots = async (locId) => {
    try {
      const res = await api.get(`/slots?parking_location_id=${locId}`);
      setSlots(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch slots");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);
  useEffect(() => {
    if (selectedLoc) fetchSlots(selectedLoc);
  }, [selectedLoc]);

  const onSubmit = async (data) => {
    try {
      await api.post("/slots", { ...data, parking_location_id: selectedLoc });
      setOpen(false);
      reset();
      fetchSlots(selectedLoc);
      toast.success("Slot created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create slot");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Slots</h1>
        <div className="header-actions">
          {locations.length > 0 && (
            <select
              className="form-input"
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              style={{ minWidth: "200px" }}
            >
              <option value="" disabled>
                Select Location
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn-primary"
            disabled={!selectedLoc}
            onClick={() => setOpen(true)}
          >
            Add Slot
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Slot Number</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="3">No slots found</td>
              </tr>
            ) : (
              slots.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: "bold" }}>{row.slot_number}</td>
                  <td>
                    <span
                      className={`badge ${row.vehicle_category === "CAR" ? "badge-primary" : "badge-secondary"}`}
                    >
                      {row.vehicle_category}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${row.status === "AVAILABLE" ? "badge-success" : row.status === "OCCUPIED" ? "badge-secondary" : "badge-error"}`}
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
          <div
            className="modal-content"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Add New Slot</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-grid single">
                  <div className="form-group">
                    <label className="form-label">
                      Slot Number (e.g. A-101)
                    </label>
                    <input
                      className="form-input"
                      required
                      {...register("slot_number")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vehicle Category</label>
                    <select
                      className="form-input"
                      required
                      defaultValue="CAR"
                      {...register("vehicle_category")}
                    >
                      <option value="CAR">CAR</option>
                      <option value="BIKE">BIKE</option>
                      <option value="TRUCK">TRUCK</option>
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
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slots;
