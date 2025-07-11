export const getCurrentDateFormatted = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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