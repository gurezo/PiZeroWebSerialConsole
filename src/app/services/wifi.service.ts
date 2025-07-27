import { Injectable, inject } from '@angular/core';
import { WiFiInfo } from '../types';
import { stringToArrayBuffer } from '../utils/buffer';
import { WiFiError } from '../utils/serial.errors';
import { FileService } from './file.service';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class WiFiService {
  private serialService = inject(SerialService);
  private fileService = inject(FileService);

  constructor() {}

  async wifiStat(): Promise<{
    ipInfo: string;
    wlInfo: string;
    ipaddr?: string;
  }> {
    try {
      const ifconfigOutput = await this.serialService.portWritelnWaitfor(
        'ifconfig',
        'EOL'
      );
      const iwconfigOutput = await this.serialService.portWritelnWaitfor(
        'iwconfig',
        'EOL'
      );

      let wdf = false;
      let ipInfo = 'wlan0: ';
      let wlInfo = '';
      let ipaddr: string | undefined;

      for (const line of ifconfigOutput.split('\n')) {
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

      wdf = false;
      for (const line of iwconfigOutput.split('\n')) {
        if (line.indexOf('wlan0') >= 0) {
          wdf = true;
        } else if (line === '') {
          wdf = false;
        }
        if (wdf) {
          wlInfo += line + '\n';
        }
      }

      return { ipInfo, wlInfo, ipaddr };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to get WiFi status: ${errorMessage}`);
    }
  }

  async wifiScan(): Promise<{ rawData: string[]; wifiInfos: WiFiInfo[] }> {
    try {
      const output = await this.serialService.portWritelnWaitfor(
        'sudo iwlist wlan0 scan',
        'EOL'
      );
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

      return { rawData: lines, wifiInfos };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to scan networks: ${errorMessage}`);
    }
  }

  async setWiFi(ssid: string, pass: string): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor('cd', 'EOL');
      await this.serialService.portWritelnWaitfor(
        'sudo touch /boot/ssh',
        'EOL'
      );

      const wifiSetup = `\
#!/bin/sh
set -eu

SSID=$1
PASSWORD=$2
DEBIAN_VERSION=$(cut -d . -f 1 /etc/debian_version)

if [ "$DEBIAN_VERSION" -le 11 ]; then
  WPA_CONF_PATH=/etc/wpa_supplicant/wpa_supplicant.conf
  sudo sh -c "cat > $WPA_CONF_PATH" <<EOL
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=JP
network={
  ssid="$SSID"
  psk="$PASSWORD"
}
EOL
  sudo wpa_cli -i wlan0 reconfigure
else
  sudo nmcli dev wifi connect "$SSID" password "$PASSWORD"
fi
`;

      await this.fileService.saveFile(
        stringToArrayBuffer(wifiSetup),
        'wifi_setup.sh'
      );
      await this.serialService.portWritelnWaitfor(
        `chmod +x wifi_setup.sh && ./wifi_setup.sh "${ssid}" "${pass}"`,
        'EOL'
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to set WiFi: ${errorMessage}`);
    }
  }

  async reboot(): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor('sudo reboot', 'EOL');
      await this.serialService.terminateConnection();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to reboot: ${errorMessage}`);
    }
  }
}
