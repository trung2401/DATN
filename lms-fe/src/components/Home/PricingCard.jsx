import React, { useState } from "react";
import Button from "../Button.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Payment from "../Payment.jsx";

const PricingCard = () => {
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const { userInfo } = useSelector((state) => state.user);
  const [showPayment, setShowPayment] = useState(false);


  const handleShowPayment = () => {
    setShowPayment(true);
  };
  const handleClosePayment = () => {
    setShowPayment(false);
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Gói học nâng cấp</h2>
      <div className="max-w-md mx-auto">
        <div className="border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 bg-white">
          <h3 className="text-2xl font-bold mb-1">Lifetime</h3>
          <p className="text-[#2C99E2] text-2xl font-bold mb-6">500,000 VND</p>
          <ul className="space-y-4 mb-8 ml-3">
            <li className="flex items-center gap-2">
              <FontAwesomeIcon
                icon="fa-solid fa-check"
                size="md"
                style={{ color: "#2C99E2" }}
              />
              <span className="text-gray-600 font-semibold">
                Full bộ đề TOEIC
              </span>
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon
                icon="fa-solid fa-check"
                size="md"
                style={{ color: "#2C99E2" }}
              />
              <span className="text-gray-600 font-semibold">
                Được giảng viên hỗ trợ trong quá trình học
              </span>
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon
                icon="fa-solid fa-check"
                size="md"
                style={{ color: "#2C99E2" }}
              />
              <span className="text-gray-600 font-semibold">
                Được cấp bộ tài liệu ngữ pháp
              </span>
            </li>
          </ul>
          {isLoggedIn ? (
            userInfo?.typeUser === 0 ? (
              <Button
                text="Đăng ký ngay"
                variant="primary"
                size="lg"
                onClick={handleShowPayment}
              />
            ) : (
              <Button
                text="Bạn đã đăng ký gói học này"
                variant="primary"
                size="lg"
                disabled={true}
              />
            )
          ) : (
            <Link to="/login">
              <Button text="Đăng ký ngay" variant="primary" size="lg" />
            </Link>
          )}
        </div>
      </div>
      {showPayment && (
        <Payment onClose={handleClosePayment} show={showPayment} />
      )}
    </div>
  );
};

export default PricingCard;