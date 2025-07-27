export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

export const concatArrayBuffers = (buffers: ArrayBuffer[]): ArrayBuffer => {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result.buffer;
};
