export const formatRupiah = (value) => {
    // Ensure the value is a number
    const number = parseFloat(value);

    // Check if the value is a valid number before formatting
    if (isNaN(number)) {
        return "0,00";
    }

    return number.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};