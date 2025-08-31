import { WiFiInfo } from '../types';

/**
 * 共通パーサーユーティリティ
 */
export class ParserUtils {
  /**
   * コマンド出力を行の配列に分割
   */
  static parseOutputLines(output: string): string[] {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  /**
   * ls -laコマンドの出力をパース
   */
  static parseLsOutput(output: string): Array<{
    name: string;
    size: number;
    isDirectory: boolean;
  }> {
    const lines = output.split('\n');
    const files: Array<{
      name: string;
      size: number;
      isDirectory: boolean;
    }> = [];

    for (const line of lines) {
      if (line.startsWith('total') || !line.trim()) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;

      const isDirectory = line.startsWith('d');
      const size = parseInt(parts[4], 10);
      const name = parts[8];

      files.push({
        name,
        size,
        isDirectory,
      });
    }

    return files;
  }

  /**
   * iwlist scanコマンドの出力をパース
   */
  static parseIwlistOutput(output: string): WiFiInfo[] {
    const lines = output.split('\n');
    const wifiInfos: WiFiInfo[] = [];
    let wifiInfo: Partial<WiFiInfo> = {};
    let first = true;

    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i];
      if (line.indexOf('Cell') >= 0 && line.indexOf('Address') > 0) {
        const parts = line.split(/\s+/);
        if (!first) {
          wifiInfos.push(wifiInfo as WiFiInfo);
        } else {
          first = false;
        }
        wifiInfo = { address: parts[4] };
      } else if (line.indexOf('ESSID:') >= 0) {
        wifiInfo.essid = line.split(':')[1].trim().replace(/"/g, '');
      } else if (line.indexOf('IEEE 802.11') >= 0) {
        wifiInfo.spec = line.split(':')[1].trim();
      } else if (line.indexOf('Quality') >= 0) {
        wifiInfo.quality = line.trim();
      } else if (line.indexOf('Group Cipher') >= 0) {
        wifiInfo.spec += ',' + line.split(':')[1].trim();
      } else if (line.indexOf('Pairwise Ciphers') >= 0) {
        wifiInfo.spec += ',' + line.split(':')[1].trim();
      } else if (line.indexOf('Authentication Suites') >= 0) {
        wifiInfo.spec += line.split(':')[1].trim();
      } else if (line.indexOf('Frequency:') >= 0) {
        wifiInfo.frequency = line.split(':')[1].trim();
      } else if (line.indexOf('Channel:') >= 0) {
        wifiInfo.channel = line.split(':')[1].trim();
      }
    }
    wifiInfos.push(wifiInfo as WiFiInfo);

    return wifiInfos;
  }

  /**
   * ifconfigコマンドの出力をパース
   */
  static parseIfconfigOutput(output: string): {
    ipInfo: string;
    ipaddr?: string;
  } {
    let wdf = false;
    let ipInfo = 'wlan0: ';
    let ipaddr: string | undefined;

    for (const line of output.split('\n')) {
      if (line.indexOf('wlan0:') >= 0) {
        wdf = true;
      } else if (line === '') {
        wdf = false;
      }
      if (wdf) {
        if (line.indexOf('inet ') >= 0) {
          ipInfo += line + '\n';
          ipaddr = line;
        } else if (line.indexOf('ether ') >= 0) {
          ipInfo +=
            'MAC Address: ' +
            line.substring(
              line.indexOf('ether ') + 6,
              line.indexOf('txqueuelen')
            ) +
            '\n';
        }
      }
    }
    ipInfo += '\n';

    return { ipInfo, ipaddr };
  }

  /**
   * iwconfigコマンドの出力をパース
   */
  static parseIwconfigOutput(output: string): string {
    let wdf = false;
    let wlInfo = '';

    for (const line of output.split('\n')) {
      if (line.indexOf('wlan0') >= 0) {
        wdf = true;
      } else if (line === '') {
        wdf = false;
      }
      if (wdf) {
        wlInfo += line + '\n';
      }
    }

    return wlInfo;
  }
}
