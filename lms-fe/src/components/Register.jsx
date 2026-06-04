import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button.jsx";
import { validateRegister } from "../utils/validate.js";
import { authRegister } from "../service/authService.js";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    const updatedFormData = { ...formData, [id]: value };
    setFormData(updatedFormData);
    const validationErrors = validateRegister(updatedFormData);
    setErrors(validationErrors);
  };

  const handleSignup = async () => {
    const validationErrors = validateRegister(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const res = await authRegister({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
        });
        if (res && res.data) {
          toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/login");
        } else {
          toast.error(res.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Signup Error:", error);
        let message =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center mb-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignup();
        }}
        className="mt-10 space-y-6 w-full max-w-md p-8 border-2 border-gray-200 bg-white shadow-md rounded-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-7">
          <h1 className="text-2xl text-center font-bold">Đăng ký</h1>
        </div>

        <div className="space-y-5">
          {/* userName */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="userName">
              Tên đăng nhập
            </label>
            <input
              id="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              className={`w-full text-[#2C8F5F] font-medium px-4 py-2.5 placeholder-[#2C8F5F] border ${
                errors.userName
                  ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  : "border-[#D0E8DF]"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AB88A]`}
            />
            {errors.userName && (
              <div className="text-sm text-red-500 font-medium">
                {errors.userName}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className={`w-full text-[#2C8F5F] font-medium px-4 py-2.5 placeholder-[#2C8F5F] border ${
                errors.email
                  ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  : "border-[#D0E8DF]"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AB88A]`}
            />
            {errors.email && (
              <div className="text-sm text-red-500 font-medium">
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập ít nhất 8 ký tự"
                className={`w-full px-4 py-2.5 text-[#2C8F5F] font-medium placeholder-[#2C8F5F] border ${
                  errors.password
                    ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-[#D0E8DF]"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AB88A]`}
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon="fa-solid fa-eye" size="sm" />
                ) : (
                  <FontAwesomeIcon icon="fa-solid fa-eye-slash" size="sm" />
                )}
              </span>
            </div>
            {errors.password && (
              <div className="text-sm text-red-500 font-medium">
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold" htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu xác nhận"
                className={`w-full px-4 py-2.5 text-[#2C8F5F] font-medium placeholder-[#2C8F5F] border ${
                  errors.confirmPassword
                    ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-[#D0E8DF]"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4AB88A]`}
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon="fa-solid fa-eye" size="sm" />
                ) : (
                  <FontAwesomeIcon icon="fa-solid fa-eye-slash" size="sm" />
                )}
              </span>
            </div>
            {errors.confirmPassword && (
              <div className="text-sm text-red-500 font-medium">
                {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        {/* Register Button */}
        <Button
          text={isLoading ? "Đang đăng ký..." : "Đăng ký"}
          variant="primary"
          size="lg"
          type="submit"
          disabled={isLoading}
        />

        {/* Login Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground text-[#2C8F5F]">
            Bạn đã có tài khoản?{" "}
          </span>
          <Link
            to="/login"
            className="text-[#2C8F5F] font-bold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
