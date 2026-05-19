import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserInfo ,clearError} from "../redux/slice/userSlice";
import Button from "./Button";
import { toast } from "react-toastify";
import { updateUser, changePassword } from "../service/userService";
import {
  validateUpdateInforUser,
  validateChangePassword,
} from "../utils/validate";

const AccountInformation = () => {
  const [isCheck, setIsCheck] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userFormData, setUserFormData] = useState({
    userName: "",
    name: "",
    phone: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [passwordFormErrors, setPasswordFormErrors] = useState({});
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!loading && !error) {
      dispatch(fetchUserInfo());
    }
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (userInfo) {
      setUserFormData({
        userName: userInfo.userName || "",
        name: userInfo.name || "",
        phone: userInfo.phone || "",
      });
    }
  }, [userInfo]);

  const inputStyle =
    "w-full px-3 py-1.5 text-[#2C8F5F] font-medium placeholder-[#2C8F5F] border border-[#D0E8DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AB88A] focus:border-[#4AB88A]";

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...userFormData, [name]: value };
    setUserFormData(updatedFormData);
    const errors = validateUpdateInforUser(updatedFormData);
    setUserFormErrors(errors);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...passwordFormData, [name]: value };
    setPasswordFormData(updatedFormData);
    const errors = validateChangePassword(updatedFormData);
    setPasswordFormErrors(errors);
  };

  const handleUpdateUser = async () => {
    const errors = validateUpdateInforUser(userFormData);
    setUserFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const res = await updateUser({
          name: userFormData.name,
          gmail: userInfo?.gmail,
          phone: userFormData.phone,
        });
        if (res?.status === 200) {
          toast.success("Cập nhật tên người dùng thành công!");
          dispatch(fetchUserInfo());
          setIsCheck(false);
        } else {
          toast.error("Cập nhật tên người dùng thất bại! Vui lòng thử lại.");
        }
      } catch (error) {
        console.log("Error:", error);
        toast.error(error.message || "Lỗi khi cập nhật tên");
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = validateChangePassword(passwordFormData);
    setPasswordFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const res = await changePassword({
          oldPassword: passwordFormData.password,
          newPassword: passwordFormData.newPassword,
        });
        if (res.status === 200) {
          toast.success("Đổi mật khẩu thành công!");
          setPasswordFormData({
            password: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          toast.error(
            res.message || "Đổi mật khẩu thất bại! Vui lòng thử lại."
          );
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <main className="flex flex-col items-center gap-8 py-8 px-4">
      {loading ? (
        <p className="font-semibold text-gray-600 text-center">
          Đang tải thông tin...
        </p>
      ) : userInfo ? (
        <>
          {isCheck ? (
            <form className="w-full max-w-2xl flex flex-col gap-4 border-2 border-gray-200 px-8 py-4 rounded-xl shadow-md bg-white">
              {/* Header */}
              <h1 className="text-2xl font-bold text-center text-black">
                Thông tin cá nhân
              </h1>
              {/* Tên đăng nhập */}
              <div className="flex flex-col gap-1">
                <label
                  className="font-semibold text-gray-600"
                  htmlFor="userName"
                >
                  Tên đăng nhập
                </label>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  className={inputStyle + " bg-[#F3F4F6]"}
                  value={userFormData.userName}
                  readOnly
                />
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-600">Email</label>
                <input
                  type="text"
                  className={inputStyle + " bg-[#F3F4F6]"}
                  value={userInfo.gmail || ""}
                  readOnly
                />
              </div>
              {/* Tên người dùng */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-600">
                  Tên người dùng
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`${inputStyle} ${
                    userFormErrors.name
                      ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-[#D0E8DF]"
                  }`}
                  value={userFormData.name}
                  onChange={handleUserChange}
                />
                {userFormErrors.name && (
                  <div className="text-sm text-red-500 font-medium">
                    {userFormErrors.name}
                  </div>
                )}
              </div>
              {/* Số điện thoại */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-600">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`${inputStyle} ${
                    userFormErrors.phone
                      ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-[#D0E8DF]"
                  }`}
                  value={userFormData.phone}
                  onChange={handleUserChange}
                />
                {userFormErrors.phone && (
                  <div className="text-sm text-red-500 font-medium">
                    {userFormErrors.phone}
                  </div>
                )}
              </div>
              {/* Button */}
              <div className="flex justify-end gap-3">
                <Button
                  text="Hủy"
                  variant="default"
                  size="sm"
                  onClick={() => setIsCheck(false)}
                />
                <Button
                  text="Lưu"
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateUser}
                />
              </div>
            </form>
          ) : (
            <div className="w-full max-w-2xl border-2 border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-6 shadow-sm bg-white">
              <h1 className="text-2xl text-center font-bold text-black">
                Thông tin cá nhân
              </h1>
              <div className="grid grid-cols-2 gap-4 px-5">
                {/* Tên đăng nhập */}
                <div>
                  <p className="font-semibold text-gray-600">Tên đăng nhập</p>
                  <p className="font-bold">{userInfo.userName}</p>
                </div>
                {/* Email */}
                <div className="pl-6">
                  <p className="font-semibold text-gray-600">Email</p>
                  <p className="font-bold">{userInfo.gmail || ""}</p>
                </div>
                {/* Tên người dùng */}
                <div>
                  <p className="font-semibold text-gray-600">Tên người dùng</p>
                  <p className="font-bold">{userInfo.name || "Không có dữ liệu"}</p>
                </div>
                {/* Số điện thoại */}
                <div className="pl-6">
                  <p className="font-semibold text-gray-600">
                    Số điện thoại
                  </p>
                  <p className="font-bold">{userInfo.phone || "Không có dữ liệu"}</p>
                </div>
              </div>
              {/* Button */}
              <div className="flex justify-end">
                <Button
                  text="Chỉnh sửa"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCheck(true)}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="font-semibold text-gray-600">
          Không thể tải thông tin người dùng.
        </p>
      )}


      {/* Đổi mật khẩu */}
      <form
        onSubmit={handleChangePassword}
        className="w-full max-w-2xl flex flex-col gap-4 border-2 border-gray-200 px-8 py-6 rounded-xl shadow-md bg-white"
      >
          {/* Header */}
          <h1 className="text-2xl font-bold text-center text-black">
            Đổi mật khẩu
          </h1>
          {/* Mật khẩu hiện tại */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-600" htmlFor="password">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập ít nhất 8 ký tự"
                className={`${inputStyle} ${
                  passwordFormErrors.password
                    ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-[#D0E8DF]"
                }`}
                value={passwordFormData.password}
                onChange={handlePasswordChange}
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
            {passwordFormErrors.password && (
              <div className="text-sm text-red-500 font-medium mt-1">
                {passwordFormErrors.password}
              </div>
            )}
          </div>
          {/* Mật khẩu mới */}
          <div className="flex flex-col gap-1">
            <label
              className="font-semibold text-gray-600"
              htmlFor="newPassword"
            >
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập ít nhất 8 ký tự"
                className={`${inputStyle} ${
                  passwordFormErrors.newPassword
                    ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-[#D0E8DF]"
                }`}
                value={passwordFormData.newPassword}
                onChange={handlePasswordChange}
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
            {passwordFormErrors.newPassword && (
              <div className="text-sm text-red-500 font-medium mt-1">
                {passwordFormErrors.newPassword}
              </div>
            )}
          </div>
          {/* Xác nhận mật khẩu */}
          <div className="flex flex-col gap-1">
            <label
              className="font-semibold text-gray-600"
              htmlFor="confirmPassword"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập ít nhất 8 ký tự"
                className={`${inputStyle} ${
                  passwordFormErrors.confirmPassword
                    ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-[#D0E8DF]"
                }`}
                value={passwordFormData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
            {passwordFormErrors.confirmPassword && (
              <div className="text-sm text-red-500 font-medium mt-1">
                {passwordFormErrors.confirmPassword}
              </div>
            )}
          </div>
          {/* Button */}
          <div className="flex justify-end">
            <Button
              text="Đổi mật khẩu"
              variant="primary"
              size="sm"
              type="submit"
            />
          </div>
      </form>
    </main>
  );
};

export default AccountInformation;
