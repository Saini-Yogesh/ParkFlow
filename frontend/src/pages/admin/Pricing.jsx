import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../assets/css/AdminCommon.css";

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
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

  const fetchPricing = async () => {
    try {
      const res = await api.get("/pricing");
      setPricing(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch pricing rules");
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchPricing();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post("/pricing", {
        ...data,
        base_price: parseFloat(data.base_price),
        hourly_price: parseFloat(data.hourly_price),
        daily_price: data.daily_price ? parseFloat(data.daily_price) : 0,
      });
      setOpen(false);
      reset();
      fetchPricing();
      toast.success("Pricing rule created successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create pricing rule",
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pricing Rules</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Add Pricing Rule
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Category</th>
              <th>Base Rate</th>
              <th>Hourly Rate</th>
              <th>Daily Max</th>
            </tr>
          </thead>
          <tbody>
            {pricing.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">No pricing rules found</td>
              </tr>
            ) : (
              pricing.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>
                    {row.parking_locations?.name || "Unknown"}
                  </td>
                  <td>
                    <span
                      className={`badge ${row.vehicle_categories?.name?.includes("Car") ? "badge-primary" : "badge-secondary"}`}
                    >
                      {row.vehicle_categories?.name}
                    </span>
                  </td>
                  <td>${row.base_price}</td>
                  <td>${row.hourly_price}/hr</td>
                  <td>
                    {row.daily_price ? (
                      `$${row.daily_price}`
                    ) : (
                      <span style={{ color: "var(--text-secondary)" }}>
                        N/A
                      </span>
                    )}
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
              <h2 className="modal-title">Add Pricing Rule</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-grid single">
                  <div className="form-group">
                    <label className="form-label">Location</label>
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

                  <div className="form-group">
                    <label className="form-label">Vehicle Category</label>
                    <select
                      className="form-input"
                      required
                      defaultValue="Car"
                      {...register("vehicle_category")}
                    >
                      <option value="Car">CAR</option>
                      <option value="Bike">BIKE</option>
                      <option value="Truck">TRUCK</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Base Rate ($)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      required
                      {...register("base_price")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate ($)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      required
                      {...register("hourly_price")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Daily Max Rate ($) - Optional
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      {...register("daily_price")}
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
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
