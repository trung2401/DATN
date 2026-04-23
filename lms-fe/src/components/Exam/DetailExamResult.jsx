import React from 'react';
import ModalWrapper from '../ModalWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DetailQuestionDisplay from './DetailQuestionDisplay';

const DetailExamResult = ({ show, onClose, item }) => {
  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div
        className="w-full max-w-4xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-4 sm:px-5 pt-5 pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center p-3 gap-1 overflow-y-auto max-h-[80vh]">
          <div className="flex items-center justify-between w-full border-b-2 border-gray-300 pb-3 mb-3">
            <h2 className="text-base font-medium sm:text-xl">
              {item.testName} | Part {item.part} | Đáp án #{item.id}
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
            >
              <FontAwesomeIcon
                icon="fa-solid fa-xmark"
                size="lg"
                style={{ color: '#565E6C' }}
              />
            </button>
          </div>
      
          <DetailQuestionDisplay
            part={item.part} 
            questionData={item.questionData}
            userAnswer={item.userAnswer}
            correctAnswer={item.correctAnswer}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DetailExamResult;