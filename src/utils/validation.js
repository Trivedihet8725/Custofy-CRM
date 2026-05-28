export const isValidEmail = (email) => {
  if (!email) return true; // Let required checks handle emptiness
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return true; // Let required checks handle emptiness
  const regex = /^\d{10}$/;
  // We only check if the raw input is exactly 10 digits
  // If the user inputs dashes or spaces, we can strip them,
  // but to be strict as requested ("phone number should be having 10 digits"),
  // we will strip non-digit characters and check if the length is exactly 10.
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};
