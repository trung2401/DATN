import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
const PublicLayout = ({children}) => {
  return (
    <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Main content */}
        <div>
            {children}
        </div>

        {/* Footer */}
        <Footer></Footer>
    </div>
  )
}

export default PublicLayout