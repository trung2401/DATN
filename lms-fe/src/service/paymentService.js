import axios from "../utils/axios-customize";

// Lấy mã QR
const getQRCode = () => {
  const URL_BACKEND = 'payment-service/getQR'
  return axios.get(URL_BACKEND);
}

// Kiểm tra thanh toán 
const checkPayment = ({code}) => {
    const URL_BACKEND = 'payment-service/checkPayment'
    const data = {
        code: code
    }
    return axios.post(URL_BACKEND, data);
}

export {
    getQRCode, checkPayment
}