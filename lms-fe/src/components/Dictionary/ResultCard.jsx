import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ResultCard = ({ wordData, query}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-center text-xl sm:text-2xl lg:text-3xl font-bold">
        Kết quả cho: {query}
      </h2>

      {/* Word definition card */}
      <div className="mb-6 rounded-lg border-2 border-gray-200 bg-white p-4 sm:p-6 shadow-md">
        <div className="mb-4 flex flex-row items-center justify-between gap-2">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">{wordData.word}</h3>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 hover:bg-gray-100">
              <FontAwesomeIcon
                icon="fa-solid fa-volume-high"
                size="sm" 
                style={{ color: "#565E6C" }}
              />
            </button>
            <span className="text-sm sm:text-base text-gray-600 font-medium">
              {wordData.pronounce || "N/A"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4 px-2 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:gap-5 items-start sm:items-center">
            <h3 className="text-sm sm:text-base font-medium min-w-[80px] sm:min-w-[100px]">
              Nghĩa:
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {wordData.description?.mean || "Không có nghĩa"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-5 items-start sm:items-center">
            <h3 className="text-sm sm:text-base font-medium min-w-[80px] sm:min-w-[100px]">
              Loại từ:
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {wordData.description?.wordType || "Không xác định"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-5 items-start sm:items-center">
            <h3 className="text-sm sm:text-base font-medium min-w-[80px] sm:min-w-[100px]">
              Ví dụ:
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {wordData.description?.example || "Không có ví dụ"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-5 items-start sm:items-center">
            <h3 className="text-sm sm:text-base font-medium min-w-[80px] sm:min-w-[100px]">
              Từ trái nghĩa:
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {wordData.description?.antonym === "none"
                ? "Không có từ trái nghĩa"
                : wordData.description?.antonym}
            </p>
          </div>
        </div>
      </div>

      {/* Synonyms card */}
      <div>
        <h2 className="mb-4 text-center text-lg sm:text-xl lg:text-2xl font-bold">
          Những từ có nghĩa tương tự
        </h2>
        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 sm:p-6 shadow-md">
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            {wordData.description?.synonyms || "Không có từ đồng nghĩa"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;