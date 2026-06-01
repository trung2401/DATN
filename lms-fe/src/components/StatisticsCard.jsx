import React from 'react'

const StatisticsCard = ({ icon, value, description, compact = false, className = '' }) => {
  const base = compact
    ? 'w-full xl:w-64 border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-1 items-center text-center shadow-md transition duration-200 bg-white'
    : 'w-full xl:w-80 border-2 border-gray-200 rounded-lg p-6 flex flex-col gap-2 items-center text-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition duration-300 bg-white'

  return (
    <div className={`${base} ${className}`}>
      <div className={`flex items-center justify-center ${compact ? 'mb-3' : 'mb-4'}`}>{icon}</div>
      <h3 className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold mb-2 text-[#25B379]`}>{value}</h3>
      <p className={`${compact ? 'text-gray-600 text-sm' : 'text-gray-600 text-xl'} font-medium`}>{description}</p>
    </div>
  )
}

export default StatisticsCard