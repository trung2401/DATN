import React, { useEffect, useState } from "react";
import { getOpenCourses } from "../../service/courseService";
import { Link } from "react-router-dom";
import Button from "../Button";
import formatCurrency from "../../utils/formatCurrency";
import { toast } from "react-toastify";

const fallbackImage =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80";

const resolveImageUrl = (image) => {
  const path = String(image || "").trim();
  if (!path) return fallbackImage;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const backendBase = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const publicBase = backendBase.replace(/\/api$/i, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${publicBase}${normalizedPath}`;
};

const FeaturedCoursesCard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getOpenCourses();
        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        // Sort by studentCount descending and get top 3
        const sorted = rows
          .sort((a, b) => Number(b?.studentCount || 0) - Number(a?.studentCount || 0))
          .slice(0, 3);

        setCourses(sorted);
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách khóa học");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        Khóa học nổi bật
      </h2>

      {loading ? (
        <div className="text-center text-gray-600 font-semibold py-10">
          Đang tải danh sách khóa học...
        </div>
      ) : error ? (
        <div className="text-center text-red-600 font-semibold py-10">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-600 font-semibold py-10">
          Hiện chưa có khóa học nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseId = course?.courseId ?? "N/A";
            const courseName = course?.courseName || "Khóa học TOEIC";
            const teacherName = course?.teacherName || "Đội ngũ giảng viên";
            const imageUrl = resolveImageUrl(course?.image);
            const studentCount = Number(course?.studentCount || 0);

            return (
              <Link to="/course" key={String(courseId)}>
                <article className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={courseName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 bg-[#25B379] text-white text-sm font-semibold px-3 py-1 rounded-sm">
                      {formatCurrency(Number(course?.price || 0))}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg leading-snug mb-2">
                        {courseName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1">
                        Giảng viên: {teacherName}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Học viên đã đăng ký: {studentCount}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[#25B379] text-sm font-semibold">
                        Xem chi tiết khóa học
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedCoursesCard;
