/**
 * Check if course registration has expired based on registration date and duration
 * @param {Date|string} registrationDate - Date when user registered for course
 * @param {number} durationMonths - Duration in months (1-12)
 * @returns {boolean} True if registration has expired
 */
export const isRegistrationExpired = (registrationDate, durationMonths) => {
  if (!registrationDate || !durationMonths) {
    return true;
  }

  const registerDate = new Date(registrationDate);
  const expiryDate = new Date(registerDate);
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  
  return new Date() > expiryDate;
};

/**
 * Get registration status considering expiration
 * @param {string} registrationStatus - Current status: 'pending', 'confirmed', 'cancelled', etc.
 * @param {Date|string} registrationDate - Date when user registered
 * @param {number} durationMonths - Duration in months
 * @returns {string} Final status: 'pending', 'confirmed', 'expired', 'cancelled'
 */
export const getEffectiveRegistrationStatus = (registrationStatus, registrationDate, durationMonths) => {
  if (registrationStatus === 'cancelled') {
    return 'cancelled';
  }

  if (registrationStatus === 'confirmed' && isRegistrationExpired(registrationDate, durationMonths)) {
    console.log('🔴 Registration EXPIRED:', {
      registerDate: registrationDate,
      duration: durationMonths,
      expiryDate: new Date(new Date(registrationDate).setMonth(new Date(registrationDate).getMonth() + durationMonths)),
      today: new Date()
    });
    return 'expired';
  }

  return registrationStatus || 'cancelled';
};

/**
 * Calculate remaining days for course registration
 * @param {Date|string} registrationDate - Date when user registered
 * @param {number} durationMonths - Duration in months
 * @returns {number} Remaining days, or -1 if expired
 */
export const getRemainingDays = (registrationDate, durationMonths) => {
  if (!registrationDate || !durationMonths) {
    return -1;
  }

  const registerDate = new Date(registrationDate);
  const expiryDate = new Date(registerDate);
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  
  const now = new Date();
  const remainingMs = expiryDate - now;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return remainingDays;
};
