/// <reference types="@types/w3c-web-serial" />

export interface SerialPortWrapper {
  port: SerialPort;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  writer: WritableStreamDefaultWriter<Uint8Array>;
}
