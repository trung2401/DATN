import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkEmail, checkOTP, resetPassword } from "../service/authService.js";
import { validateForgotPassword } from "../utils/validate.js";
import Button from "./Button.jsx";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    let currentValues = {
      email: email,
      otpCode: otpCode,
      newPassword: newPassword,
    };

    if (field === "email") {
      currentValues.email = value;
    } else if (field === "otpCode") {
      currentValues.otpCode = value;
    } else if (field === "newPassword") {
      currentValues.newPassword = value;
    }

    const validationErrors = validateForgotPassword(currentValues);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: validationErrors[field] || "",
    }));

    if (field === "email") setEmail(value);
    if (field === "otpCode") setOtpCode(value);
    if (field === "newPassword") setNewPassword(value);
  };

  // Check email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForgotPassword({
      email,
      otpCode,
      newPassword,
    });
    setErrors(validationErrors);

    if (validationErrors.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await checkEmail({ email });
      if (res.status === 200) {
        setStep(2);
        setErrors({ email: "", otpCode: "", newPassword: "" });
        toast.success("Mã OTP đã được gửi đến email của bạn.");
      } else {
        toast.error("Email không tồn tại.");
      }
    } catch (err) {
      toast.error(err || "Có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Check OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForgotPassword({
      email,
      otpCode,
      newPassword,
    });
    setErrors(validationErrors);

    if (validationErrors.otpCode) {
      setLoading(false);
      return;
    }

    try {
      const res = await checkOTP({ email, otpCode: otpCode });
      if (res.status === 200) {
        setStep(3);
        setErrors({ email: "", otpCode: "", newPassword: "" });
        toast.success("Xác nhận OTP thành công.");
      } else {
        toast.error("Mã OTP không đúng, hoặc đã hết hạn.");
      }
    } catch (err) {
      toast.error(err || "Có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForgotPassword({
      email,
      otpCode,
      newPassword,
    });
    setErrors(validationErrors);

    if (validationErrors.newPassword) {
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword({ email, newPassword });
      if (res.status === 200) {
        toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        toast.error("Đặt lại mật khẩu thất bại.");
      }
    } catch (err) {
      toast.error(err || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtpCode("");
      setErrors({ email: "", otpCode: "", newPassword: "" });
    } else if (step === 3) {
      setStep(2);
      setNewPassword("");
      setErrors({ email: "", otpCode: "", newPassword: "" });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg border-2 border-gray-200">
        <div className="flex flex-row items-center justify-center mb-7">
          {step !== 1 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition duration-200"
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
            </button>
          )}
          <h1 className="flex-1 text-2xl text-center font-bold">
            {step === 1
              ? "Quên mật khẩu"
              : step === 2
              ? "Nhập mã OTP"
              : "Đặt mật khẩu mới"}
          </h1>
        </div>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="font-semibold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập email"
                className={`w-full text-[#49719C] font-medium px-4 py-2.5 placeholder-[#49719C] border 
                    ${
                      errors.email
                        ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        : "border-[#CEDBE8]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA4CE] focus:border-[#7BA4CE]
                  `}
              />
              {errors.email && (
                <p className="text-red-500 text-sm font-semibold mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <Button
              text={loading ? "Đang kiểm tra..." : "Xác nhận"}
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
            />
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="font-semibold" htmlFor="otp">
                Mã OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otpCode}
                onChange={(e) => handleInputChange("otpCode", e.target.value)}
                placeholder="Nhập mã OTP"
                className={`w-full text-[#49719C] font-medium px-4 py-2.5 placeholder-[#49719C] border 
                  ${
                    errors.otpCode
                      ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-[#CEDBE8]"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA4CE] focus:border-[#7BA4CE]
                `}
              />
              {errors.otpCode && (
                <p className="text-red-500 text-sm font-semibold mt-1">
                  {errors.otpCode}
                </p>
              )}
            </div>
            <Button
              text={loading ? "Đang xác nhận..." : "Xác nhận OTP"}
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
            />
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="font-semibold" htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  placeholder="Nhập mật khẩu mới"
                  className={`w-full text-[#49719C] font-medium px-4 py-2.5 placeholder-[#49719C] border 
                    ${
                      errors.newPassword
                        ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        : "border-[#CEDBE8]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7BA4CE] focus:border-[#7BA4CE]
                  `}
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
              {errors.newPassword && (
                <p className="text-red-500 text-sm font-semibold mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <Button
              text={loading ? "Đang lưu..." : "Lưu mật khẩu"}
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
            />
          </form>
        )}

        <div className="text-center text-sm mt-4">
          <span className="text-[#49719C]">Bạn muốn quay lại? </span>
          <Link
            to="/login"
            className="text-[#49719C] font-bold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
