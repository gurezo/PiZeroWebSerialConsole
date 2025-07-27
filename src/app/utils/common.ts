export const sleep = (msec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, msec));

export const removeControlChars = (str: string): string => {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};

export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

export const escapePath = (path: string): string => {
  return path.replace(/([^A-Za-z0-9_\-\.\/\:])/g, '\\$1');
};
