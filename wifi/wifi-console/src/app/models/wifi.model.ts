export interface WiFiInfo {
  address: string;
  essid: string;
  spec: string;
  quality: string;
  frequency?: string;
  channel?: string;
}

export interface WiFiState {
  ipInfo: string;
  wlInfo: string;
  wifiList: WiFiInfo[];
  isConnected: boolean;
  ipAddress?: string;
  isLoading: boolean;
  error?: string;
}

export interface WiFiSetupConfig {
  ssid: string;
  password: string;
}
