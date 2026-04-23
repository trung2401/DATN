import React from 'react'

const StatisticsCard = ({icon, value, description}) => {
  return (
    <div className="w-full xl:w-80 
                border-2 border-gray-200 rounded-lg p-6 flex flex-col gap-2 items-center text-center
                shadow-xl hover:shadow-2xl hover:-translate-y-1 transition duration-300 bg-white">
      <div className="flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-3xl font-bold mb-2 text-[#2C99E2]">{value}</h3>
      <p className="text-gray-600 text-xl font-medium">{description}</p>
    </div>
  )
}

export default StatisticsCard