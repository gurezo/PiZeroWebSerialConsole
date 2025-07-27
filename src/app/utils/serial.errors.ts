export class SerialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SerialError';
  }
}

export class FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileError';
  }
}

export class EditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EditorError';
  }
}

export class WiFiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WiFiError';
  }
}

export class ChirimenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChirimenError';
  }
}
