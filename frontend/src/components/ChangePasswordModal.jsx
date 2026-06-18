import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../api/axios";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Change Password</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-grid single">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  {...register("oldPassword")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  minLength={6}
                  {...register("newPassword")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  minLength={6}
                  {...register("confirmPassword")}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
