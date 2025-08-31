import { Injectable, inject } from '@angular/core';
import { WiFiInfo } from '../types';
import { FileUtils, ParserUtils, WiFiUtils } from '../utils';
import { WiFiError } from '../utils/serial.errors';
import { FileService } from './file.service';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class WiFiService {
  private serialService = inject(SerialService);
  private fileService = inject(FileService);

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

      const { ipInfo, ipaddr } =
        ParserUtils.parseIfconfigOutput(ifconfigOutput);
      const wlInfo = ParserUtils.parseIwconfigOutput(iwconfigOutput);

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
      const wifiInfos = ParserUtils.parseIwlistOutput(output);

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

      const encoder = new TextEncoder();
      await this.fileService.saveFile(
        encoder.encode(wifiSetup).buffer,
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

  // Additional WiFi configuration methods
  async configureWifi(ssid: string, password: string): Promise<void> {
    try {
      // wpa_supplicant設定ファイルを作成
      const configContent = WiFiUtils.generateWpaSupplicantConfig(
        ssid,
        password
      );

      // 設定ファイルを保存
      await this.saveWifiConfig(configContent);

      // WiFiサービスを再起動
      await this.restartWifiService();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`WiFi configuration failed: ${errorMessage}`);
    }
  }

  private async saveWifiConfig(configContent: string): Promise<void> {
    try {
      // 既存の設定をバックアップ
      await this.serialService.portWritelnWaitfor(
        'sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup',
        'pi@raspberrypi:',
        10000
      );

      // 新しい設定を保存
      const encoder = new TextEncoder();
      const buffer = encoder.encode(configContent);

      // base64エンコードして送信
      const base64 = FileUtils.arrayBufferToBase64(buffer);

      // Ctrl+Cでフォアグラウンドプロセスを停止
      await FileUtils.prepareForFileOperation(this.serialService);

      // 設定ファイルに保存
      await this.serialService.portWritelnWaitfor(
        'sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null',
        '\n',
        10000
      );
      await this.serialService.portWritelnWaitfor(base64, '\n', 1000);

      // Ctrl+Dで入力終了
      await FileUtils.finalizeFileOperation(this.serialService);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to save WiFi config: ${errorMessage}`);
    }
  }

  private async restartWifiService(): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        'sudo systemctl restart wpa_supplicant',
        'pi@raspberrypi:',
        10000
      );
      await this.serialService.portWritelnWaitfor(
        'sudo systemctl restart networking',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to restart WiFi service: ${errorMessage}`);
    }
  }

  async getWifiStatus(): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        'iwconfig wlan0',
        'pi@raspberrypi:',
        10000
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to get WiFi status: ${errorMessage}`);
    }
  }

  async enableWifi(): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        'sudo ifconfig wlan0 up',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to enable WiFi: ${errorMessage}`);
    }
  }

  async disableWifi(): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        'sudo ifconfig wlan0 down',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to disable WiFi: ${errorMessage}`);
    }
  }

  async getIpAddress(): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        'hostname -I',
        'pi@raspberrypi:',
        10000
      );
      const lines = result.split('\n');
      return lines[0]?.trim() || '';
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to get IP address: ${errorMessage}`);
    }
  }

  async showNetworkConfig(): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        'cat /etc/network/interfaces',
        'pi@raspberrypi:',
        10000
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new WiFiError(`Failed to show network config: ${errorMessage}`);
    }
  }
}
