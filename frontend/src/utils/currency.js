/**
 * Formats a numeric value into Indian Rupees (INR) using Indian number system.
 * Examples:
 * 125000 -> ₹1,25,000
 * 12500  -> ₹12,500
 * 999    -> ₹999
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const numericAmount = Number(amount);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

export default formatINR;
