export const getCurrentDateFormatted = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getCurrentDateTimeFormatted = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const getFirstDayOfMonthFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1

  // The first day of the month is always '01'
  const day = '01';

  return `${year}-${month}-${day}`;
};

// You can also add a more general function to get the first day of a given month
// This allows for more flexibility if you need to get the first day of a month other than the current one
export const getFirstDayOfGivenMonthFormatted = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = '01';
  return `${year}-${month}-${day}`;
};

export const formatDateToDDMMYYYY = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr; // fallback for invalid format
  return `${day}/${month}/${year}`;
};

export const formatISODateToDDMMYYYY = (isoDateString) => {
  try {
    const date = new Date(isoDateString);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string provided to formatISODateToDDMMYYYY: ${isoDateString}`);
      return isoDateString; // Return original string or handle error as preferred
    }

    // Use UTC methods (getUTCDate, getUTCMonth, getUTCFullYear)
    // as the 'Z' in the ISO string indicates UTC time.
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error(`Error formatting ISO date string "${isoDateString}":`, error);
    return isoDateString; // Fallback in case of unexpected errors during parsing
  }
};

