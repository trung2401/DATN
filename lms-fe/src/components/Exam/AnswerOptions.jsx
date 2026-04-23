import React from 'react'

const AnswerOptions = React.memo(({ options, selected, onChange }) => {
    return (
      <div className="space-y-1">
        {options.map((option, index) => (
          <label key={index} className="flex items-center space-x-2 cursor-pointer">
            <div className='flex items-center justify-center'>
                <input
                  type="radio"
                  name={`answer-${selected}`}
                  value={option}
                  checked={selected === option}
                  onChange={() => onChange(option)}
                  className="h-4 w-4"
                  aria-label={`Option ${option}`}
                />
            </div>
            <span className='flex flex-wrap'>{option}</span>
          </label>
        ))}
      </div>
    );
  });

export default AnswerOptions