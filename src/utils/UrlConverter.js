export const convertLocalPathToUrl = (filePath) => {
  if (!filePath) return ''; // Handle cases where filePath is null or empty

  // Replace backslashes with forward slashes for URLs
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Remove "C:/Backup/" and prepend your base URL
  const baseUrl = "https://erp.sdlindonesia.com/files/";
  const pathAfterRoot = normalizedPath.replace('C:/Backup/', '');

  return `${baseUrl}${pathAfterRoot}`;
};