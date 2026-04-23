import React from 'react'
import Button from '../Button.jsx'
import { Link } from 'react-router-dom';

const FeatureCard = ({title, icon, description, path}) => {
  return (
    <Link to={path}>
      <div 
          className="border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center text-center 
                  shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 bg-white"    
      >
        <div className="flex items-center justify-center bg-[#E6F0FA] p-3 rounded-lg mb-4 w-17 h-17">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <Button text="Khám phá" variant="primary" size="lg"/>

      </div>
    </Link>
  )
}

export default FeatureCard