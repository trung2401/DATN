import React from 'react'
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo-bg_gray.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Footer = () => {
  return (
    <footer className="bg-[#F5F5F5] py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-15">
          {/* Brand Column */}
          <div>
            <div className="flex items-center -mt-4">
              <img src={Logo} alt="" className="h-14 w-auto -ml-5" />
              <span className="font-bold text-lg -ml-2">EnglishMastery</span>
            </div>
            <p className="text-gray-600 text-sm ">
              Nền tảng học tiếng Anh hiệu quả với các công cụ thông minh giúp bạn tiến bộ nhanh chóng.
            </p>
          </div>

          {/* Contact Info Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Thông tin liên hệ</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: contact@englishmastery.com</p>
              <p>Số điện thoại: 888 8888 888</p>
            </div>
          </div>

          {/* Links Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Liên kết</h3>
            <div className="space-y-2 text-sm">
              <p>
                <Link href="/" className="text-gray-600 hover:text-[#2C99E2]">
                  Giới thiệu
                </Link>
              </p>
              <p>
                <Link href="/" className="text-gray-600 hover:text-[#2C99E2]">
                  Chính sách bảo mật
                </Link>
              </p>
              <p>
                <Link href="/" className="text-gray-600 hover:text-[#2C99E2]">
                  Hỗ trợ
                </Link>
              </p>
            </div>
          </div>

        {/* Social Media Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Liên hệ</h3>
            <div className="flex space-x-3">
              <div className='w-10 h-10 flex items-center justify-center bg-white border border-[#49719c] p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110'>
                <FontAwesomeIcon 
                  icon="fa-brands fa-facebook" 
                  size="xl" 
                  style={{color: "#49719c"}} 
                />
              </div>
              <div className='w-10 h-10 flex items-center justify-center bg-white border border-[#49719c] p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 '>
                <FontAwesomeIcon 
                  icon="fa-brands fa-linkedin" 
                  size="xl" 
                  style={{color: "#49719c"}} 
                />
              </div>
              <div className='w-10 h-10 flex items-center justify-center bg-white border border-[#49719c] p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110'>
                <FontAwesomeIcon 
                  icon="fa-brands fa-instagram" 
                  size="xl" 
                  style={{color: "#49719c"}} 
                />
              </div>
              <div className='w-10 h-10 flex items-center justify-center bg-white border border-[#49719c] p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 '>
                <FontAwesomeIcon 
                  icon="fa-brands fa-square-x-twitter" 
                  size="xl" 
                  style={{color: "#49719c"}} 
                />
              </div>
            </div>
          </div>


        </div>
        
      </div>
      <div className="mt-12 pt-6 border-t border-gray-400 text-center text-sm text-gray-500">
          2025 EnglishMastery. Bản quyền thuộc về chúng tôi
      </div>
    </footer>
  )
}

export default Footer