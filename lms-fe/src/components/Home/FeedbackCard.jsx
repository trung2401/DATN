import React from 'react'

const FeedbackCard = ({ name, message, avatar }) => {
    return (
        <div className="border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 bg-white">
            <div className="flex items-center mb-4">
                <img src={avatar} alt="" className=" rounded-full w-20 h-20 object-cover mr-4"/>
                <h3 className="text-xl font-bold">{name}</h3>
            </div>
            <p className="text-gray-600 font-semibold italic">"{message}"</p>
        </div>
    );
  };
  

export default FeedbackCard