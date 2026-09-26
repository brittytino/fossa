export const CLI_DEVICE_SERVICE_TOKEN = Symbol.for('CliDeviceService');

export interface DeviceValidationResult {
    deviceToken?: string;
}

export interface ICliDeviceService {
    validateOrRegisterDevice(params: {
        deviceId: string;
        deviceToken?: string;
        organizationId: string;
        userId?: string;
        userAgent?: string;
    }): Promise<DeviceValidationResult>;
}
