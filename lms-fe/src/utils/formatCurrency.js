const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = Number(amount);
  }
  return amount.toLocaleString('vi-VN') + ' VNĐ';
}

export default formatCurrency
