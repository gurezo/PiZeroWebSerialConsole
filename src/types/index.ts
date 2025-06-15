/// <reference types="@types/w3c-web-serial" />

export interface FileInfo {
  name: string;
  size: number;
  isDirectory: boolean;
}

export interface WiFiInfo {
  address: string;
  essid: string;
  spec: string;
  quality: string;
  frequency: string;
  channel: string;
}

export interface SerialPortWrapper {
  port: SerialPort;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  writer: WritableStreamDefaultWriter<Uint8Array>;
}

export interface WaitForSerialIn {
  inputValue: string;
  RegExp: RegExp | null;
  CBF: ((input: string) => void) | null;
  TimeOutID: number | null;
}

export interface SourcePath {
  fileName: string;
  dir: string;
}
