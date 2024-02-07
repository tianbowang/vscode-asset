/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requestHidDevice = exports.requestSerialPort = exports.requestUsbDevice = void 0;
    async function requestUsbDevice(options) {
        const usb = navigator.usb;
        if (!usb) {
            return undefined;
        }
        const device = await usb.requestDevice({ filters: options?.filters ?? [] });
        if (!device) {
            return undefined;
        }
        return {
            deviceClass: device.deviceClass,
            deviceProtocol: device.deviceProtocol,
            deviceSubclass: device.deviceSubclass,
            deviceVersionMajor: device.deviceVersionMajor,
            deviceVersionMinor: device.deviceVersionMinor,
            deviceVersionSubminor: device.deviceVersionSubminor,
            manufacturerName: device.manufacturerName,
            productId: device.productId,
            productName: device.productName,
            serialNumber: device.serialNumber,
            usbVersionMajor: device.usbVersionMajor,
            usbVersionMinor: device.usbVersionMinor,
            usbVersionSubminor: device.usbVersionSubminor,
            vendorId: device.vendorId,
        };
    }
    exports.requestUsbDevice = requestUsbDevice;
    async function requestSerialPort(options) {
        const serial = navigator.serial;
        if (!serial) {
            return undefined;
        }
        const port = await serial.requestPort({ filters: options?.filters ?? [] });
        if (!port) {
            return undefined;
        }
        const info = port.getInfo();
        return {
            usbVendorId: info.usbVendorId,
            usbProductId: info.usbProductId
        };
    }
    exports.requestSerialPort = requestSerialPort;
    async function requestHidDevice(options) {
        const hid = navigator.hid;
        if (!hid) {
            return undefined;
        }
        const devices = await hid.requestDevice({ filters: options?.filters ?? [] });
        if (!devices.length) {
            return undefined;
        }
        const device = devices[0];
        return {
            opened: device.opened,
            vendorId: device.vendorId,
            productId: device.productId,
            productName: device.productName,
            collections: device.collections
        };
    }
    exports.requestHidDevice = requestHidDevice;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvZGV2aWNlQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCekYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLE9BQWlDO1FBQ3ZFLE1BQU0sR0FBRyxHQUFJLFNBQWlCLENBQUMsR0FBRyxDQUFDO1FBQ25DLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNWLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNiLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxPQUFPO1lBQ04sV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1lBQy9CLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYztZQUNyQyxjQUFjLEVBQUUsTUFBTSxDQUFDLGNBQWM7WUFDckMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGtCQUFrQjtZQUM3QyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsa0JBQWtCO1lBQzdDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxxQkFBcUI7WUFDbkQsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtZQUN6QyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7WUFDM0IsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1lBQy9CLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtZQUNqQyxlQUFlLEVBQUUsTUFBTSxDQUFDLGVBQWU7WUFDdkMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlO1lBQ3ZDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxrQkFBa0I7WUFDN0MsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1NBQ3pCLENBQUM7SUFDSCxDQUFDO0lBM0JELDRDQTJCQztJQVNNLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxPQUFpQztRQUN4RSxNQUFNLE1BQU0sR0FBSSxTQUFpQixDQUFDLE1BQU0sQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDYixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLE9BQU87WUFDTixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO1NBQy9CLENBQUM7SUFDSCxDQUFDO0lBaEJELDhDQWdCQztJQVlNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxPQUFpQztRQUN2RSxNQUFNLEdBQUcsR0FBSSxTQUFpQixDQUFDLEdBQUcsQ0FBQztRQUNuQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDVixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JCLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNOLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtZQUNyQixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7WUFDekIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTO1lBQzNCLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztZQUMvQixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7U0FDL0IsQ0FBQztJQUNILENBQUM7SUFuQkQsNENBbUJDIn0=