import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

declare global {
  interface Navigator {
    serial: {
      requestPort(): Promise<SerialPort>;
    };
  }
}

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream;
  writable: WritableStream;
}

@Injectable({
  providedIn: 'root',
})
export class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private writer: WritableStreamDefaultWriter | null = null;

  constructor() {}

  async connect(): Promise<void> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
    } catch (error) {
      console.error('Failed to connect to serial port:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
    } catch (error) {
      console.error('Failed to disconnect from serial port:', error);
      throw error;
    }
  }

  write(data: string): Observable<string> {
    if (!this.writer) {
      return of('');
    }

    return from(this.writer.write(new TextEncoder().encode(data))).pipe(
      map(() => data),
      catchError((error) => {
        console.error('Failed to write to serial port:', error);
        throw error;
      })
    );
  }

  read(): Observable<string> {
    if (!this.reader) {
      return of('');
    }

    return new Observable((subscriber) => {
      const read = async () => {
        try {
          const { value, done } = await this.reader!.read();
          if (done) {
            subscriber.complete();
            return;
          }
          subscriber.next(new TextDecoder().decode(value));
          read();
        } catch (error) {
          subscriber.error(error);
        }
      };
      read();
    });
  }

  isPortConnected(): boolean {
    return this.port !== null;
  }
}
