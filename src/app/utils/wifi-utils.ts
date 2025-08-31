/**
 * 共通WiFi設定ユーティリティ
 */
export class WiFiUtils {
  /**
   * wpa_supplicant設定ファイルの内容を生成
   */
  static generateWpaSupplicantConfig(ssid: string, password: string): string {
    return `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=JP

network={
    ssid="${ssid}"
    psk="${password}"
    key_mgmt=WPA-PSK
}`;
  }

  /**
   * レガシーWiFi設定スクリプトを生成
   */
  static generateLegacyWifiSetupScript(ssid: string, password: string): string {
    return `#!/bin/sh
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
fi`;
  }

  /**
   * WiFi設定のバックアップコマンドを生成
   */
  static generateBackupCommand(): string {
    return 'sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup';
  }

  /**
   * WiFi設定の保存コマンドを生成
   */
  static generateSaveConfigCommand(): string {
    return 'sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null';
  }

  /**
   * WiFiサービスの再起動コマンドを生成
   */
  static generateRestartCommands(): string[] {
    return [
      'sudo systemctl restart wpa_supplicant',
      'sudo systemctl restart networking',
    ];
  }
}
