import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../assets/css/AdminCommon.css";

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState("");
  const [open, setOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
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

  const fetchPricing = async (locId) => {
    try {
      const res = await api.get(locId ? `/pricing?parking_location_id=${locId}` : "/pricing");
      setPricing(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch pricing rules");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLoc) fetchPricing(selectedLoc);
  }, [selectedLoc]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        base_price: parseFloat(data.base_price),
        hourly_price: parseFloat(data.hourly_price),
        daily_price: data.daily_price ? parseFloat(data.daily_price) : 0,
      };

      if (editRule) {
        await api.patch(`/pricing/${editRule.id}`, payload);
        toast.success("Pricing rule updated successfully!");
      } else {
        await api.post("/pricing", payload);
        toast.success("Pricing rule created successfully!");
      }
      setOpen(false);
      setEditRule(null);
      reset({ parking_location_id: "", vehicle_category: "Car", base_price: "", hourly_price: "", daily_price: "" });
      fetchPricing(selectedLoc);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save pricing rule",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pricing rule?")) return;
    try {
      await api.delete(`/pricing/${id}`);
      toast.success("Pricing rule deleted successfully");
      fetchPricing(selectedLoc);
    } catch (err) {
      toast.error("Failed to delete pricing rule");
    }
  };

  const openEditModal = (rule) => {
    setEditRule(rule);
    reset({
      parking_location_id: rule.parking_location_id,
      vehicle_category: rule.vehicle_categories?.name?.includes("Car") ? "Car" : rule.vehicle_categories?.name?.includes("Bike") ? "Bike" : "Truck",
      base_price: rule.base_price,
      hourly_price: rule.hourly_price,
      daily_price: rule.daily_price || "",
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pricing Rules</h1>
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
              setEditRule(null);
              reset({ parking_location_id: selectedLoc, vehicle_category: "Car", base_price: "", hourly_price: "", daily_price: "" });
              setOpen(true);
            }}
          >
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pricing.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="6">No pricing rules found</td>
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
              <h2 className="modal-title">{editRule ? "Edit Pricing Rule" : "Add Pricing Rule"}</h2>
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
                      disabled={!!editRule}
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
                      disabled={!!editRule}
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
                  {editRule ? "Save Changes" : "Create Rule"}
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
