import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAverageTestScoreByUser,
  getResultListByUser,
  getTotalAttemptsByUser,
} from "../service/examService.js";
import FeatureCard from "../components/Home/FeatureCard.jsx";
import Button from "../components/Button.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FeaturedCoursesCard from "../components/Home/FeaturedCoursesCard.jsx";
import LearningStatisticsCard from "../components/StatisticsCard.jsx";
import RecentResultsCard from "../components/Home/RecentResultsCard.jsx";
import { Link } from "react-router-dom";
// const banner = "https://pub-e860ef97c13d407c808df35aa1a698c7.r2.dev/material-web-app/1.png";
import banner from "../assets/images/bannerToeic.png";

const sectionData = {
  banner: {
    title: "Học Tiếng Anh hiệu quả cùng ToeicZone",
    description: "Luyện thi, từ vựng, và kỹ năng Tiếng Anh mọi lúc, mọi nơi",
    buttonText: "Bắt đầu ngay",
    image: banner,
  },
  userWelcome: {
    message: "Tiếp tục hành trình học Tiếng Anh của bạn ngay hôm nay.",
    buttonText: "Làm bài thi ngay",
  },
  features: [
    {
      icon: (
        <FontAwesomeIcon
          icon="fa-solid fa-file"
          size="2xl"
          style={{ color: "#25B379" }}
        />
      ),
      title: "Luyện đề chuẩn quốc tế",
      description: "Hơn 500 đề thi từ cơ bản đến nâng cao",
      path: "/exam",
    },
    {
      icon: (
        <FontAwesomeIcon
          icon="fa-solid fa-book-open"
          size="2xl"
          style={{ color: "#25B379" }}
        />
      ),
      title: "Khóa học TOEIC thực chiến",
      description: "Xem lộ trình, học phí và chọn khóa học phù hợp",
      path: "/course",
    },
    {
      icon: (
        <FontAwesomeIcon
          icon="fa-solid fa-pen-to-square"
          size="2xl"
          style={{ color: "#25B379" }}
        />
      ),
      title: "Ghi chú cá nhân hóa",
      description: "Lưu trữ và quản lý ghi chú dễ dàng",
      path: "/note",
    },
  ],
};

const Home = () => {
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const userInfo = useSelector((state) => state.user.userInfo);
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return null;

      const payload = JSON.parse(atob(payloadBase64));
      return payload?.id ?? null;
    } catch {
      return null;
    }
  };

  const currentUserId =
    userInfo?.userId ?? userInfo?.id ?? userInfo?.UserID ?? getUserIdFromToken();
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageTotal: 0,
  });
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState("");
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    const userId = currentUserId;

    if (!isLoggedIn || !userId) return;

    const fetchHomeStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const [attemptRes, averageRes] = await Promise.all([
          getTotalAttemptsByUser({ userId }),
          getAverageTestScoreByUser({ userId }),
        ]);

        setStats({
          totalAttempts: Number(attemptRes?.data?.totalAttempts) || 0,
          averageTotal: Number(averageRes?.data?.averageScore?.total) || 0,
        });
      } catch (err) {
        setStatsError(err?.message || "Không thể tải thống kê.");
        setStats({ totalAttempts: 0, averageTotal: 0 });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchHomeStats();
  }, [isLoggedIn, currentUserId]);

  useEffect(() => {
    const userId = currentUserId;

    if (!isLoggedIn || !userId) return;

    const fetchRecentResults = async () => {
      try {
        setRecentLoading(true);
        setRecentError("");

        const res = await getResultListByUser({ userId });
        const apiList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        setRecentResults(
          apiList.map((item) => ({
            idTestHistory: item.historyOfTestID,
            nameTest: item.testName,
            score: Number(item.scoreTotal) || 0,
            total: 990,
            date: item.dateTest,
          }))
        );
      } catch (err) {
        setRecentError(err?.message || "Không thể tải kết quả gần đây.");
        setRecentResults([]);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecentResults();
  }, [isLoggedIn, currentUserId]);

  const statistics = [
    {
      icon: (
        <FontAwesomeIcon
          icon="fa-solid fa-file"
          size="5x"
          style={{ color: "#25B379" }}
        />
      ),
      value: stats.totalAttempts,
      description: "Số lần làm đề",
    },
    {
      icon: (
        <FontAwesomeIcon
          icon="fa-solid fa-star"
          size="5x"
          style={{ color: "#25B379" }}
        />
      ),
      value: `${stats.averageTotal}/990`,
      description: "Điểm trung bình",
    },
    // {
    //   icon: (
    //     <FontAwesomeIcon
    //       icon="fa-solid fa-cube"
    //       size="5x"
    //       style={{ color: "#25B379" }}
    //     />
    //   ),
    //   value: userInfo?.typeUser === 0 ? "Chưa mua gói học!" : "Lifetime",
    //   description: "Gói học đã mua",
    // },
  ];

  return (
    <main className="flex flex-col space-y-16">
      {/* Banner Section */}
      <section className="py-16 bg-gradient-to-b from-[#E6F0FA] to-white">
        {!isLoggedIn ? (
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-7 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                {sectionData.banner.title}
              </h1>
              <p className="text-gray-600 font-medium">
                {sectionData.banner.description}
              </p>
              <Link to="/login">
                <Button
                  text={sectionData.banner.buttonText}
                  variant="primary"
                  size="md"
                />
              </Link>
            </div>
            <div className="h-75 md:h-80">
              <img
                src={sectionData.banner.image}
                alt=""
                className="object-cover rounded-3xl"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="container mx-auto px-4 grid md:grid-cols-1 gap-8 items-center">
              <div className="space-y-6 flex flex-col justify-center items-center">
                <h1 className="text-4xl text-center font-bold leading-tight">
                  Chào mừng bạn trở lại, {userInfo?.userName || "User"}!
                </h1>
                <p className="text-gray-600">
                  {sectionData.userWelcome.message}
                </p>
                <Link to="/exam">
                  <Button
                    text={sectionData.userWelcome.buttonText}
                    variant="primary"
                    size="md"
                  />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 mt-20">
              {statsLoading ? (
                <div className="text-gray-600 font-semibold text-center text-lg">
                  Đang tải thống kê...
                </div>
              ) : statsError ? (
                <div className="text-red-600 text-center font-semibold text-lg">
                  {statsError}
                </div>
              ) : stats.totalAttempts === 0 ? (
                <div className="text-gray-600 font-semibold text-center text-lg">
                  Chưa có thống kê
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center items-center">
                  {statistics.map((stat, index) => (
                    <LearningStatisticsCard
                      key={index}
                      icon={stat.icon}
                      value={stat.value}
                      description={stat.description}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Recent Result Section */}
      {isLoggedIn && (
        <section className="py-3">
          <h2 className="text-3xl font-bold text-center mb-10">
            Kết quả gần đây
          </h2>
          <div className="container mx-auto px-4">
            {recentLoading ? (
              <div className="text-gray-600 font-semibold text-center text-lg">
                Đang tải kết quả...
              </div>
            ) : recentError ? (
              <div className="text-red-600 text-center font-semibold text-lg">
                {recentError}
              </div>
            ) : recentResults.length === 0 ? (
              <div className="text-gray-600 font-semibold text-center text-lg">
                Bạn chưa làm bài thi nào.{" "}
                <Link to="/exam" className="text-[#25B379] hover:underline">
                    Thử làm bài thi ngay!
                </Link>
              </div>
            ) : (
              <RecentResultsCard data={recentResults} />
            )}
          </div>
        </section>
      )}

      {/* Feature Section */}
      <section className="py-3">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Khám phá các tính năng nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sectionData.features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                path={feature.path}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-3">
        <FeaturedCoursesCard />
      </section>

      {!isLoggedIn && (
        <section className="py-15 bg-[#E6F0FA] flex items-center justify-center">
          <div className="text-center mx-auto px-4 flex-col items-center justify-center">
            <h2 className="text-3xl font-bold mb-6">
              Sẵn sàng chinh phục Tiếng Anh?
            </h2>
            <Link to="/login">
              <Button
                text="Đăng ký ngay"
                variant="primary"
                size="md"
              />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;
