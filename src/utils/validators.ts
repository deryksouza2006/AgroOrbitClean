export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

export function isValidCoordinate(value: string): boolean {
  if (!value.trim()) return true; // optional
  return isValidNumber(value);
}
