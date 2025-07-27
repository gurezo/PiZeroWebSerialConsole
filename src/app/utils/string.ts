export const removeControlChars = (str: string): string => {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};

export const escapePath = (path: string): string => {
  return path.replace(/([^A-Za-z0-9_\-\.\/\:])/g, '\\$1');
};

export const parseCommandOutput = (output: string): string[] => {
  return output.split('\n').filter((line) => line.trim() !== '');
};

export const extractIpAddress = (line: string): string | undefined => {
  const match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[1] : undefined;
};
