import React from "react";
import Button from "../Button";

const SideBarMobile = ({
  parts,
  allQuestionIds,
  findPartConfig,
  userAnswers,
  selectedQuestionId,
  currentGroupQuestionIds,
  isStarted,
  handleQuestionSelect,
  answeredQuestions,
  setShowModal,
  submitting,
  isOpen,
  onClose,
}) => {
  return (
    <div
      className={`
        fixed inset-0 z-50 bg-black/40 transition-opacity duration-300
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
      onClick={onClose} 
    >
      <div
        className={`
          w-[300px] h-full bg-white border-2 border-gray-200 rounded-r-2xl shadow-xl
          flex flex-col transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="fixed w-full px-5 py-4 bg-white rounded-tr-2xl">
            <span className="flex w-full items-center justify-center font-bold border-2 rounded-lg border-[#2C99E2] px-3 py-2.5">
                {answeredQuestions}/200
            </span>
        </div>
        <div className="overflow-y-auto hide-scrollbar w-full px-4 py-4 mt-15 flex flex-col items-center gap-6">
          {parts.map((item) => (
            <div key={`part-nav-${item.part}`} className="w-full space-y-3">
              <h1 className="font-bold text-2xl">{`Part ${item.part}`}</h1>
              <div className="w-full space-y-2">
                <div className="w-full grid grid-cols-5 gap-y-2 justify-items-center">
                  {allQuestionIds
                    .filter((id) => findPartConfig(id)?.part === item.part)
                    .map((question) => {
                      const isAnswered = !!userAnswers[question];
                      const isSelected = selectedQuestionId === question;
                      const isInCurrentGroup =
                        currentGroupQuestionIds?.includes(question);

                      return (
                        <span
                          key={question}
                          onClick={() => {
                            if (isStarted) {
                              handleQuestionSelect(question);
                              onClose();
                            }
                          }}
                          className={`
                            cursor-pointer flex items-center justify-center w-11 h-11 rounded-lg font-medium transition-all duration-150 border-2
                            ${
                              !isStarted
                                ? "opacity-50 border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
                                : isAnswered
                                ? "bg-[#2C99E2] text-white border-[#2C99E2]"
                                : isSelected
                                ? "bg-blue-100 border-[#2C99E2]"
                                : isInCurrentGroup
                                ? "border-[#2C99E2] bg-white hover:bg-blue-50"
                                : "border-gray-300 bg-white hover:border-[#2C99E2] hover:bg-blue-50"
                            }
                          `}
                        >
                          {question + 1}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            text="Nộp bài"
            variant="primary"
            size="lg"
            onClick={() => isStarted && setShowModal(true)}
            disabled={!isStarted || submitting || answeredQuestions === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default SideBarMobile;