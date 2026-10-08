const detectUserRole = (email) => {
  if (!email) return 'Employee';
  
  const e = email.toLowerCase();
  
  // IT Admin detection
  if (e.includes('admin') || e === 'emmadivashishta@gmail.com') {
    return 'IT Admin';
  }
  
  // Manager detection
  if (e.includes('manager') || e.includes('lead') || e.includes('director')) {
    return 'Manager';
  }
  
  // HR detection
  if (e.includes('hr') || e.includes('recruit') || e.includes('talent')) {
    return 'HR';
  }
  
  // Default fallback
  return 'Employee';
};

module.exports = { detectUserRole };
