import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalWrapper from "../ModalWrapper";
import Button from "../../components/Button.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  fetchLockAccountByAdmin,
  fetchUpdateUserByAdmin,
} from "../../redux/slice/adminSlice.js";
import { toast } from "react-toastify";

const EditUser = ({ show, onClose, user, onUpdated }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.userId) {
      toast.error("Không tìm thấy ID người dùng");
      return;
    }

    try {
      await dispatch(
        fetchUpdateUserByAdmin({
          userId: user.userId,
          name: formData.name,
          phone: formData.phone,
        })
      ).unwrap();

      await dispatch(fetchAllUsers()).unwrap();
      onUpdated?.();
      toast.success("Cập nhật người dùng thành công!");
      onClose();
    } catch (err) {
      toast.error(err || "Cập nhật người dùng thất bại");
    }
  };

  const handleToggleLock = async () => {
    if (!user?.userId) {
      toast.error("Không tìm thấy ID người dùng");
      return;
    }

    const isLocked = Number(user.status) !== 1;

    try {
      await dispatch(
        fetchLockAccountByAdmin({
          userId: user.userId,
          lock: !isLocked,
        })
      ).unwrap();

      await dispatch(fetchAllUsers()).unwrap();
      onUpdated?.();
      toast.success(isLocked ? "Mở khóa tài khoản thành công!" : "Khóa tài khoản thành công!");
      onClose();
    } catch (err) {
      toast.error(err || "Cập nhật trạng thái tài khoản thất bại");
    }
  };

  const isLocked = Number(user?.status) !== 1;

  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div
        className="w-full max-w-3xl mx-auto flex flex-col bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 pt-6 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chỉnh sửa người dùng</h2>
          <button
            onClick={onClose}
            type="button"
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: "#565E6C" }} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">ID</label>
            <input
              value={user?.userId || ""}
              readOnly
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tên đăng nhập</label>
            <input
              value={user?.userName || ""}
              readOnly
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tên người dùng</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              value={user?.gmail || ""}
              readOnly
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
            <input
              value={isLocked ? "Locked" : "Active"}
              readOnly
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            text={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            variant={isLocked ? "primary" : "delete"}
            size="sm"
            disabled={loading}
            onClick={handleToggleLock}
          />
          <Button text="Lưu" variant="primary" size="sm" disabled={loading} onClick={handleSave} />
          <Button text="Hủy" variant="default" size="sm" onClick={onClose} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EditUser;