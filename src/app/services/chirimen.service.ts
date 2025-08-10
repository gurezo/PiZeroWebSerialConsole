import { Injectable, inject } from '@angular/core';
import { FileInfo } from '../types';
import { FileService } from './file.service';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class ChirimenService {
  private serialService = inject(SerialService);
  private fileService = inject(FileService);
  private appDir = '~/myApp';
  private absAppDir = '/home/pi/myApp/';

  async setupChirimen(): Promise<string> {
    let message = 'START CHIRIMEN SETUP';
    const nodeVersion = 'v22.9.0';

    await this.serialService.portWritelnWaitfor('cd', 'EOL');
    const nodeVOutput = await this.serialService.portWritelnWaitfor(
      'node -v',
      'EOL',
      20000
    );

    let nodeV: string;
    if (nodeVOutput.indexOf('-bash:') === 0) {
      await this.serialService.portWritelnWaitfor('mkdir chirimenSetup', 'EOL');
      await this.serialService.portWritelnWaitfor('cd chirimenSetup', 'EOL');
      await this.serialService.portWritelnWaitfor(
        `VERSION=${nodeVersion}`,
        'EOL'
      );
      await this.serialService.portWritelnWaitfor('DISTRO=linux-armv6l', 'EOL');

      message = 'NOW GETTING NODE.JS RUNTIME';
      await this.serialService.portWritelnWaitfor(
        'wget https://unofficial-builds.nodejs.org/download/release/$VERSION/node-$VERSION-$DISTRO.tar.xz',
        'EOL',
        200000
      );

      await this.serialService.portWritelnWaitfor(
        'sudo mkdir -p /usr/local/lib/nodejs',
        'EOL'
      );

      message = 'NOW EXTRACTING NODE.JS RUNTIME';
      await this.serialService.portWritelnWaitfor(
        'sudo tar -xJvf node-$VERSION-$DISTRO.tar.xz -C /usr/local/lib/nodejs',
        'EOL',
        200000
      );

      await this.serialService.portWritelnWaitfor(
        `echo -n -e "# Nodejs\nVERSION=${nodeVersion}\nDISTRO=linux-armv6l\n\nexport PATH=/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin:$PATH\n" | tee -a ~/.profile`,
        'EOL'
      );

      await this.serialService.portWritelnWaitfor('. ~/.profile', 'EOL');

      message = 'NODE.JS RUNTIME INSTALLATION COMPLETED!';
      await this.serialService.portWritelnWaitfor('cd', 'EOL');
      const nodeVersionOutput = await this.serialService.portWritelnWaitfor(
        'node -v',
        'EOL',
        20000
      );
      nodeV = 'Version:<br> node.js:' + nodeVersionOutput;
      const npmVersionOutput = await this.serialService.portWritelnWaitfor(
        'npm -v',
        'EOL',
        20000
      );
      nodeV += '<br> npm:' + npmVersionOutput;
    } else {
      nodeV = 'Version:<br> node.js:' + nodeVOutput;
      const npmVersionOutput = await this.serialService.portWritelnWaitfor(
        'npm -v',
        'EOL',
        20000
      );
      nodeV += '<br> npm:' + npmVersionOutput;
    }

    // Add legacy camera support
    await this.serialService.portWritelnWaitfor(
      'sudo raspi-config nonint do_camera 0',
      'EOL'
    );
    await this.serialService.portWritelnWaitfor(
      'sudo raspi-config nonint do_legacy 0',
      'EOL'
    );

    // Add forever
    const foreverOutput = await this.serialService.portWritelnWaitfor(
      'which forever',
      'EOL'
    );
    if (foreverOutput.indexOf('forever') === -1) {
      message = nodeV + '<br><br>Installing forever command for Node.js';
      await this.serialService.portWritelnWaitfor(
        'sudo npm install -g forever',
        'EOL',
        300000
      );
    }

    message =
      nodeV +
      '<br><br>NEXT building CHIRIMEN environment and its libraries on ' +
      this.appDir;

    await this.buildChirimenDevDir(this.appDir);
    await this.serialService.portWritelnWaitfor('cd', 'EOL');
    await this.fileService.showDir();

    message =
      'CONGRATURATIONS. setup completed!<br>Your prototyping directory is ' +
      this.appDir;
    return message;
  }

  private async buildChirimenDevDir(targetDir: string): Promise<void> {
    if (!targetDir) {
      targetDir = this.appDir;
    }

    await this.serialService.portWritelnWaitfor(`mkdir ${targetDir}`, 'EOL');
    await this.serialService.portWritelnWaitfor(`cd ${targetDir}`, 'EOL');
    await this.serialService.portWritelnWaitfor(
      'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
      'EOL',
      20000
    );
    await this.serialService.portWritelnWaitfor(
      'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
      'EOL',
      20000
    );
    await this.serialService.portWritelnWaitfor('npm install', 'EOL', 500000);
  }

  async i2cdetect(): Promise<string> {
    const output = await this.serialService.portWritelnWaitfor(
      'i2cdetect -y 1',
      'EOL'
    );
    let result = '<pre><code>     ';
    for (let i = 1; i < output.length - 1; i++) {
      result += output[i] + '\n';
    }
    result += '</pre></code>';
    return result;
  }

  async getJsApps(): Promise<string[]> {
    await this.serialService.portWritelnWaitfor(`cd ${this.absAppDir}`, 'EOL');
    await this.fileService.showDir();
    const { files } = await this.fileService.listAll();
    return files
      .filter((file: FileInfo) => file.name.endsWith('.js'))
      .map((file: FileInfo) => file.name);
  }

  async stopAllForeverApp(): Promise<void> {
    await this.serialService.portWritelnWaitfor(
      'forever stopall',
      'EOL',
      20000
    );
  }

  async setForeverApp(appName: string): Promise<void> {
    await this.serialService.portWritelnWaitfor(
      `forever start -w ${appName}`,
      'EOL',
      20000
    );
  }
}
