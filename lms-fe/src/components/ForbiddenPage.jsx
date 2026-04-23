import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Button from "./Button";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center max-w-xl space-y-6">
        <h1 className="text-9xl font-extrabold text-gray-800">403</h1>
        <p className="text-2xl font-semibold text-gray-800">Truy cập bị từ chối</p>

        <p className="text-lg text-gray-700 font-semibold">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>

        <div className="flex justify-center items-center pt-4">
          <Link to="/">
            <Button
              text="Trang chủ"
              variant="primary"
              size="sm"
              icon={<FontAwesomeIcon icon={faHome} />}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
