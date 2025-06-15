import { WaitForSerialIn } from '../../types';
import { SerialError } from '../../utils/errors';
import { removeControlChars } from '../../utils/string';
import { SerialIO } from './io';

export class SerialCommand {
  private waitForSerialIn: WaitForSerialIn = {
    inputValue: '',
    RegExp: null,
    CBF: null,
    TimeOutID: null,
  };

  constructor(private io: SerialIO) {}

  async execute(
    cmd: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.waitForSerialIn.RegExp = new RegExp(prompt);
      this.waitForSerialIn.CBF = (input: string) => {
        resolve(input);
      };
      this.waitForSerialIn.TimeOutID = window.setTimeout(() => {
        this.waitForSerialIn.RegExp = null;
        this.waitForSerialIn.CBF = null;
        this.waitForSerialIn.TimeOutID = null;
        reject(new SerialError('Timeout'));
      }, timeout);

      this.io.write(cmd + '\n');
    });
  }

  processInput(input: string): string | null {
    this.waitForSerialIn.inputValue += input;

    if (
      this.waitForSerialIn.RegExp &&
      this.waitForSerialIn.CBF &&
      this.waitForSerialIn.inputValue.match(this.waitForSerialIn.RegExp) != null
    ) {
      const result = removeControlChars(this.waitForSerialIn.inputValue);
      if (this.waitForSerialIn.TimeOutID) {
        clearTimeout(this.waitForSerialIn.TimeOutID);
      }
      this.waitForSerialIn.RegExp = null;
      this.waitForSerialIn.CBF = null;
      this.waitForSerialIn.TimeOutID = null;
      this.waitForSerialIn.inputValue = '';
      return result;
    }

    return null;
  }

  getWaitForSerialIn(): WaitForSerialIn {
    return this.waitForSerialIn;
  }
}
