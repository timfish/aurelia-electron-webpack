import * as usbDetect from 'usb-detection';

export class App {
  public devices: usbDetect.Device[] = [];

  public async attached() {
    this.devices = await usbDetect.find();

    usbDetect.on('change', async device => {
      this.devices = await usbDetect.find();
    });

    usbDetect.startMonitoring();
  }
}
