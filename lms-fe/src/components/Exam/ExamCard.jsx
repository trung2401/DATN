import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../Button.jsx";
import PropTypes from "prop-types";
import image_exame from "../../assets/images/EXAM.png";
// const image_exame = "https://pub-e860ef97c13d407c808df35aa1a698c7.r2.dev/material-web-app/5.png"

const ExamCard = ({ title, onClick, locked = false }) => {
  const handleClick = () => {
    onClick();
  };
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-3 p-4 
        border-2 border-gray-200 rounded-2xl shadow-sm
        transition duration-300 ease-in-out transform 
        ${locked ? "" : "hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:border-[#25B379] hover:shadow-blue-200 cursor-pointer"}
        w-full max-w-xs
        ${locked ? "opacity-50 relative pointer-events-none" : ""}
      `}
      onClick={locked ? undefined : handleClick}
    >
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-semibold">
            Chưa phát hành
          </span>
        </div>
      )}
      <img src={image_exame} alt="" className="object-contain w-48 h-32" />
      <h1 className="text-2xl font-semibold text-center">{title}</h1>
      <div className="flex flex-col items-center text-[#2C8F5F] font-medium">
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon="fa-regular fa-clock" />
          120 phút
        </span>
        <span className="text-center">7 phần thi | 200 câu hỏi</span>
      </div>
      <Button text="Chi tiết" variant="default" size="lg" />
    </div>
  );
};

export default ExamCard;
