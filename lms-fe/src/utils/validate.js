
// Regex cho email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hàm validate form đăng nhập
const validateLogin = ({ userName, password }) => {
  const errors = {};

  if (!userName || !userName.trim()) {
    errors.userName = 'Tên đăng nhập không được để trống';
  }

  if (!password) {
    errors.password = 'Mật khẩu không được để trống';
  }

  return errors;
};

// Hàm validate form đăng ký
const validateRegister = ({ userName, email, password, confirmPassword }) => {
  const errors = {};

  if (!userName || userName.trim().length < 2) {
    errors.userName = 'Tên người dùng phải có ít nhất 2 ký tự';
  }

  if (!email) {
    errors.email = 'Email không được để trống';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!password) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  return errors;
};

// Hàm validate cho Add/Update Vocabulary
const validateAddUpdateVocabulary = ({ word, description, pronounce, example }) => {
  const errors = {};

  if (!word || !word.trim()) {
    errors.word = 'Vui lòng nhập từ vựng';
  }
  if (!description || !description.trim()) {
    errors.description = 'Vui lòng nhập nghĩa của từ';
  }
  if (!pronounce || !pronounce.trim()) {
    errors.pronounce = 'Vui lòng nhập cách phát âm';
  }
  if (!example || !example.trim()) {
    errors.example = 'Vui lòng nhập ví dụ';
  }

  return errors;
};

// Hàm validate cho đổi mật khẩu
const validateChangePassword = ({ password, newPassword, confirmPassword }) => {
  const errors = {};

  if (!password) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
  }

  if (!newPassword) {
    errors.newPassword = 'Mật khẩu mới không được để trống';
  } else if (newPassword.length < 8) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
  }else if (newPassword === password) {
    errors.newPassword = 'Mật khẩu mới không được giống mật khẩu cũ';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  return errors;
};

// Hàm validate thông tin người dùng

const validateUpdateInforUser = ({ name, phone }) => {
    const error = {};

    if (!name || name.trim().length < 2) {
      error.name = 'Tên người dùng phải có ít nhất 2 ký tự';
    }

    if (phone && !/^[0-9+\-\s()]{8,15}$/.test(phone)) {
      error.phone = 'Số điện thoại không hợp lệ';
    }

    return error;    
}

// Hàm validate cho quên mật khẩu
const validateForgotPassword = ({ email, otpCode, newPassword }) => {
  const errors = {};
  const numberRegex = /^\d+$/;
  
  if(!email) {
    errors.email = 'Email không được để trống';
  }else if (!emailRegex.test(email)) {
    errors.email = 'Email không hợp lệ';
  }

  if(!otpCode) {
    errors.otpCode = 'Mã OTP không được để trống';
  }else if (otpCode.length < 6) {
    errors.otpCode = 'Mã OTP phải có ít nhất 6 ký tự';
  }else if (!numberRegex.test(otpCode)) {
    errors.otpCode = 'Mã OTP phải là số';
  }
  
  if(!newPassword) {
    errors.newPassword = 'Mật khẩu mới không được để trống';
  }else if (newPassword.length < 8) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
  }
  return errors;
}

// Hàm validate thêm user 
const validateAddUser = (
  { userName, gmail, password, confirmPassword, name, phone, roleId },
  existingUsers = []
) => {
  const errors = {};
  const normalizedUserName = userName?.trim().toLowerCase();
  const normalizedGmail = gmail?.trim().toLowerCase();
  const normalizedRoleId = Number(roleId);

  const isDuplicateUserName = existingUsers.some(
    (user) => user.userName?.trim().toLowerCase() === normalizedUserName
  );
  const isDuplicateEmail = existingUsers.some(
    (user) => user.gmail?.trim().toLowerCase() === normalizedGmail
  );

  if (!userName || userName.trim().length < 2) {
    errors.userName = 'Tên đăng nhập phải có ít nhất 2 ký tự';
  } else if (isDuplicateUserName) {
    errors.userName = 'Tên đăng nhập đã tồn tại';
  }

  if (!name || name.trim().length < 2) {
    errors.name = 'Tên người dùng phải có ít nhất 2 ký tự';
  }

  if (!gmail) {
    errors.email = 'Email không được để trống';
  } else if (!emailRegex.test(gmail)) {
    errors.email = 'Email không hợp lệ';
  } else if (isDuplicateEmail) {
    errors.email = 'Email đã tồn tại';
  }

  if (!password) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }

  if (phone && !/^[0-9+\-\s()]{8,15}$/.test(phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  if (![1, 2].includes(normalizedRoleId)) {
    errors.roleId = 'RoleID chỉ được là 1 hoặc 2';
  }

  return errors;
};
export {
    validateLogin, validateRegister, validateAddUpdateVocabulary, validateChangePassword, validateUpdateInforUser, validateForgotPassword,validateAddUser
}