import { Injectable } from '@angular/core';
import { WiFiInfo, WiFiSetupConfig } from '../models/wifi.model';

@Injectable({
  providedIn: 'root',
})
export class WifiService {
  private portWritelnWaitfor: any;
  private getOutputLines: any;
  private cmdPrompt: any;
  private str2arrayBuffer: any;
  private saveFile: any;
  private closeConnection: any;

  constructor() {
    // これらのプロパティは、親ウィンドウから注入される必要があります
    this.portWritelnWaitfor = (window as any).opener?.portWritelnWaitfor;
    this.getOutputLines = (window as any).opener?.getOutputLines;
    this.cmdPrompt = (window as any).opener?.cmdPrompt;
    this.str2arrayBuffer = (window as any).opener?.str2arrayBuffer;
    this.saveFile = (window as any).opener?.saveFile;
    this.closeConnection = (window as any).opener?.closeConnection;
  }

  async getWifiStatus(): Promise<{
    ipInfo: string;
    wlInfo: string;
    ipAddress?: string;
  }> {
    const ret = this.getOutputLines(
      await this.portWritelnWaitfor(' ifconfig', this.cmdPrompt)
    );
    let wdf = false;
    let ipInfo = 'wlan0: ';
    let wlInfo = '';
    let ipaddr: string | undefined;

    for (const line of ret) {
      if (line.includes('wlan0:')) {
        wdf = true;
      } else if (line === '') {
        wdf = false;
      }
      if (wdf) {
        if (line.includes('inet ')) {
          ipInfo += line + '\n';
          ipaddr = line;
        } else if (line.includes('ether ')) {
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

    wdf = false;
    const wlRet = this.getOutputLines(
      await this.portWritelnWaitfor(' iwconfig', this.cmdPrompt)
    );
    for (const line of wlRet) {
      if (line.includes('wlan0')) {
        wdf = true;
      } else if (line === '') {
        wdf = false;
      }
      if (wdf) {
        wlInfo += line + '\n';
      }
    }

    return {
      ipInfo,
      wlInfo,
      ipAddress: ipaddr
        ? ipaddr
            .substring(ipaddr.indexOf('inet ') + 4, ipaddr.indexOf('netmask'))
            .trim()
        : undefined,
    };
  }

  async scanWifi(): Promise<WiFiInfo[]> {
    const ret = this.getOutputLines(
      await this.portWritelnWaitfor(' sudo iwlist wlan0 scan', this.cmdPrompt)
    );
    const wifiInfos: WiFiInfo[] = [];
    let wifiInfo: Partial<WiFiInfo> = {};
    let first = true;

    for (let i = 1; i < ret.length - 1; i++) {
      const row = ret[i].split(/:/);

      if (ret[i].includes('Cell') && ret[i].includes('Address')) {
        const addressRow = ret[i].split(/\s+/);
        if (!first) {
          wifiInfos.push(wifiInfo as WiFiInfo);
        } else {
          first = false;
        }
        wifiInfo = { address: addressRow[4] };
      } else if (ret[i].includes('ESSID:')) {
        wifiInfo.essid = row[1].trim().replaceAll('"', '');
      } else if (ret[i].includes('IEEE 802.11')) {
        wifiInfo.spec = row[1].trim();
      } else if (ret[i].includes('Quality')) {
        wifiInfo.quality = ret[i].trim();
      } else if (ret[i].includes('Group Cipher')) {
        wifiInfo.spec += ',' + row[1].trim();
      } else if (ret[i].includes('Pairwise Ciphers')) {
        wifiInfo.spec += ',' + row[1].trim();
      } else if (ret[i].includes('Authentication Suites')) {
        wifiInfo.spec += row[1].trim();
      } else if (ret[i].includes('Frequency:')) {
        wifiInfo.frequency = row[1].trim();
      } else if (ret[i].includes('Channel:')) {
        wifiInfo.channel = row[1].trim();
      }
    }

    wifiInfos.push(wifiInfo as WiFiInfo);
    return wifiInfos;
  }

  async setupWifi(config: WiFiSetupConfig): Promise<void> {
    await this.getOutputLines(
      await this.portWritelnWaitfor(' cd', this.cmdPrompt)
    );
    await this.getOutputLines(
      await this.portWritelnWaitfor(' sudo touch /boot/ssh', this.cmdPrompt)
    );

    const wifiSetupScript = `\
#!/bin/sh
set -eu

SSID=\$1
PASSWORD=\$2
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

    await this.saveFile(this.str2arrayBuffer(wifiSetupScript), 'wifi_setup.sh');
    await this.portWritelnWaitfor(
      ` chmod +x wifi_setup.sh && ./wifi_setup.sh "${config.ssid}" "${config.password}"`,
      this.cmdPrompt
    );
  }

  async reboot(): Promise<void> {
    await this.getOutputLines(
      await this.portWritelnWaitfor(' sudo reboot', this.cmdPrompt)
    );
    this.closeConnection();
  }

  async checkConnection(): Promise<boolean> {
    try {
      const ret = this.getOutputLines(
        await this.portWritelnWaitfor(
          ' wget --spider -nv https://tutorial.chirimen.org/',
          this.cmdPrompt
        )
      );
      return ret[ret.length - 2].includes('200 OK');
    } catch (e) {
      return false;
    }
  }
}
