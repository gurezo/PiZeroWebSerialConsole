# PiZero Web Serial Console - Angular Version

<p align="right">Language: <a href="https://chirimen.org/PiZeroWebSerialConsole/">Japanese</a>, <a href="https://translate.google.co.jp/translate?sl=ja&tl=en&u=https%3A%2F%2Fchirimen.org%2FPiZeroWebSerialConsole%2F">English (Google Translation)</a></p>

This is an Angular v20.x standalone application version of the PiZero Web Serial Console, originally developed for CHIRIMEN (Web of Things).

## Features

- **Serial Communication**: Connect to Raspberry Pi Zero via Web Serial API
- **File Management**: Browse and manage files on the Pi Zero
- **WiFi Configuration**: Configure WiFi settings on the Pi Zero
- **Chirimen Setup**: Automated setup of CHIRIMEN development environment
- **Code Editor**: Built-in code editor for JavaScript development
- **I2C Detection**: Detect I2C devices connected to the Pi Zero

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- Modern browser with Web Serial API support (Chrome, Edge, Opera)
- Raspberry Pi Zero with OTG cable connection

## Installation

1. Clone the repository:

```bash
git clone https://github.com/gurezo/PiZeroWebSerialConsole.git
cd PiZeroWebSerialConsole
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/pizerowebserialconsole` directory.

## Usage

1. **Connect to Pi Zero**: Click the "Connect" button and select your Pi Zero from the serial port list
2. **Browse Files**: Use "Show Directory" to view files on the Pi Zero
3. **Configure WiFi**: Use "WiFi Status" and "WiFi Scan" to manage network settings
4. **Setup Chirimen**: Use "Setup Chirimen" to install the CHIRIMEN development environment
5. **Edit Code**: Use the built-in editor to create and edit JavaScript applications

## Project Structure

```
src/
├── app/
│   ├── services/           # Angular services
│   │   ├── serial.service.ts
│   │   ├── file.service.ts
│   │   ├── editor.service.ts
│   │   ├── wifi.service.ts
│   │   ├── chirimen.service.ts
│   │   └── serial/         # Serial communication classes
│   ├── app.component.ts    # Main application component
│   ├── app.config.ts       # Application configuration
│   └── app.routes.ts       # Routing configuration
├── interfaces/             # TypeScript interfaces
├── types/                  # Type definitions
├── utils/                  # Utility functions
├── main.ts                 # Application entry point
└── index.html              # Main HTML file
```

## Development

This application uses Angular v20.x with standalone components and services. All services are provided at the root level and can be injected into components as needed.

### Key Services

- **SerialService**: Handles Web Serial API communication
- **FileService**: Manages file operations on the Pi Zero
- **EditorService**: Provides code editing functionality
- **WiFiService**: Manages WiFi configuration
- **ChirimenService**: Handles CHIRIMEN environment setup

## Browser Compatibility

This application requires a browser that supports the Web Serial API:

- Chrome 89+
- Edge 89+
- Opera 76+

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Original Project

This is an Angular port of the original PiZero Web Serial Console project. For the original version, see the [CHIRIMEN website](https://chirimen.org/PiZeroWebSerialConsole/).
