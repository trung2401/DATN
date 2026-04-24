import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../components/Button.jsx";
import ModalWrapper from "../ModalWrapper.jsx";
import { useState, useEffect } from "react";

const FlipCard = ({ show, onClose, vocabulary, vocabularies, onStudy, readOnlyStudy = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVocab, setCurrentVocab] = useState(vocabulary);

  useEffect(() => {
    if (vocabulary && vocabularies && vocabularies.length > 0) {
      const index = vocabularies.findIndex(v => v.id === vocabulary.id);
      
      if (index !== -1) {
        setCurrentIndex(index);
        setCurrentVocab(vocabularies[index]);
      } else {
        setCurrentIndex(0);
        setCurrentVocab(vocabularies[0]);
      }
    }
  }, [vocabulary, vocabularies]);

  if (!show || !currentVocab) return null;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleStudy = () => {
    if (readOnlyStudy) return;
    onStudy(currentVocab);
    onClose();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentVocab(vocabularies[currentIndex + 1]);
      setIsFlipped(false);
    }
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentVocab(vocabularies[currentIndex - 1]);
      setIsFlipped(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex flex-col gap-5 border-2 border-gray-200 rounded-lg p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-between w-full border-b-2 border-gray-200 pb-3">
          <h2 className="text-xl font-medium text-center sm:text-2xl">
            Học từ vựng
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
          >
            <FontAwesomeIcon
              icon="fa-solid fa-xmark"
              size="lg"
              style={{ color: "#565E6C" }}
            />
          </button>
        </div>
        {/* Flip Card */}
        <div
          className="relative w-full h-60 cursor-pointer border-2 border-gray-200 rounded-xl shadow-md"
          onClick={handleFlip}
        >
          <div
            className={`absolute w-full h-full transition-all duration-500 ${
              isFlipped ? "rotateY-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* Front Side */}
            <div 
              className="absolute w-full h-full rounded-lg shadow-md p-4 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <h3 className="text-3xl font-bold">{currentVocab.word}</h3>
              {currentVocab.wordType && (
                <p className="text-sm text-gray-500 font-semibold mt-1 italic">({currentVocab.wordType})</p>
              )}
              <p className="text-md text-gray-600 font-semibold mt-2">
                {currentVocab.pronounce}
              </p>
            </div>
            
            {/* Back Side */}
            <div 
              className="absolute w-full h-full rounded-lg shadow-md px-5 py-4 flex flex-col gap-4 backface-hidden"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{currentVocab.word}</h2>
                {currentVocab.wordType && (
                  <p className="text-sm text-gray-500 font-semibold italic">({currentVocab.wordType})</p>
                )}
                <p className="text-md text-gray-600 font-semibold ml-2">
                  {currentVocab.pronounce}
                </p>
              </div>
              <div className="text-md text-gray-600 font-semibold">
                <span className="font-bold text-black">Nghĩa:</span> {currentVocab.description}
              </div>
              <div className="text-md text-gray-600 font-semibold">
                <span className="font-bold text-black">Ví dụ:</span> {currentVocab.example}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full justify-between">
          <div className="flex items-center justify-center">
            {!readOnlyStudy ? (
              <Button
                text={Number(currentVocab.status) === 1 ? "Đã học" : "Đánh dấu là đã học"}
                icon={Number(currentVocab.status) === 1 ? null : <FontAwesomeIcon icon="fa-solid fa-check" />}
                variant="default"
                size="sm"
                onClick={handleStudy}
                textColor={Number(currentVocab.status) === 1 ? "text-white" : "text-gray-600"}
                border="border-2 border-gray-200"
                bg={Number(currentVocab.status) === 1 ? "bg-black" : "bg-white"}
                disabled={Number(currentVocab.status) === 1}
              />
            ) : (
              <span className="text-sm text-gray-500 font-semibold">Chế độ xem từ vựng</span>
            )}
          </div>
          <div className="flex gap-2 justify-center items-center">
            <button
              type="button"
              className={`flex items-center justify-center w-10 h-10 ${
                currentIndex > 0 ? "bg-gray-200 cursor-pointer" : "bg-gray-100 cursor-not-allowed"
              } rounded-lg transition-all duration-200 ease-in-out`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <FontAwesomeIcon 
                icon="fa-solid fa-chevron-left"
                size="lg"
                style={{ color: currentIndex === 0 ? "#aaa" : "#565E6C" }}
              />
            </button>
            <Button
              text="Lật thẻ"
              variant="primary"
              size="sm"
              icon={<FontAwesomeIcon icon="fa-solid fa-rotate" />}
              onClick={handleFlip}
            />
            <button
              type="button"
              className={`flex items-center justify-center w-10 h-10 ${
                currentIndex < vocabularies.length - 1 ? "bg-gray-200 cursor-pointer" : "bg-gray-100 cursor-not-allowed"
              } rounded-lg transition-all duration-200 ease-in-out`}
              onClick={handleNext}
              disabled={currentIndex === vocabularies.length - 1}
            >
              <FontAwesomeIcon 
                icon="fa-solid fa-chevron-right"
                size="lg"
                style={{ color: currentIndex === vocabularies.length - 1 ? "#aaa" : "#565E6C" }}
              />
            </button>
          </div>
        </div>
        
        {/* Pagination indicator */}
        <div className="text-center font-semibold text-sm text-gray-500">
          {currentIndex + 1} / {vocabularies.length}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default FlipCard;
