import React from 'react';
import Button from '../Button';

const Sidebar = ({
  timeLeft,
  formatTime,
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
}) => {
  return (
    <div className="w-[350px] h-[700px] hidden lg:flex lg:flex-col xl:flex xl:flex-col border-2 border-gray-200 rounded-2xl shadow-xl">
      <div className="w-full py-2.5 border-2 border-[#2C99E2] rounded-tr-2xl rounded-tl-2xl flex items-center justify-center bg-[#2C99E2]">
        <span className="text-white text-3xl font-bold">
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="overflow-y-auto hide-scrollbar w-full px-4 py-4 flex flex-col items-center gap-6">
        {parts.map((item) => (
          <div key={`part-nav-${item.part}`} className="w-full space-y-3">
            <h1 className="font-bold text-2xl">{`Part ${item.part}`}</h1>
            <div className="w-full space-y-2">
              <div className="w-full grid lg:grid-cols-4 xl:grid-cols-5 gap-y-2 justify-items-center">
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
                        onClick={() =>
                          isStarted && handleQuestionSelect(question)
                        }
                        className={`
                          cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all duration-150 border-2
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
      <div className="flex gap-3 items-center justify-center py-3 rounded-bl-2xl rounded-br-2xl">
        <span className="font-bold border-2 rounded-lg border-[#2C99E2] px-3 py-2.5">
          {answeredQuestions}/200
        </span>
        <Button
          text="Nộp bài"
          variant="primary"
          size="md"
          onClick={() => isStarted && setShowModal(true)}
          disabled={!isStarted || submitting || answeredQuestions === 0}
        />
      </div>
    </div>
  );
};

export default Sidebar;