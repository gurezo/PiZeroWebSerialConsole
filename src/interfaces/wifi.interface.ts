import { WiFiInfo } from '../types';

export interface IWiFiService {
  wifiStat(): Promise<{ ipInfo: string; wlInfo: string; ipaddr?: string }>;
  wifiScan(): Promise<{ rawData: string[]; wifiInfos: WiFiInfo[] }>;
  setWiFi(ssid: string, pass: string): Promise<void>;
  reboot(): Promise<void>;
}
