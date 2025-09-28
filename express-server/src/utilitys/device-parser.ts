import { Request } from 'express';

export interface DeviceInfo {
    userAgent: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
    ipAddress?: string;
}

export function parseDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Parse device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        if (/iPad|Tablet/i.test(userAgent)) {
            deviceType = 'tablet';
        } else {
            deviceType = 'mobile';
        }
    } else if (/Windows|Macintosh|Linux|X11/i.test(userAgent)) {
        deviceType = 'desktop';
    }

    // Parse browser
    let browser = 'Unknown';
    if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
        browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
        browser = 'Firefox';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
        browser = 'Safari';
    } else if (/Edge/i.test(userAgent)) {
        browser = 'Edge';
    } else if (/Opera/i.test(userAgent)) {
        browser = 'Opera';
    }

    // Parse OS
    let os = 'Unknown';
    if (/Windows NT 10/i.test(userAgent)) {
        os = 'Windows 10';
    } else if (/Windows NT 6.1/i.test(userAgent)) {
        os = 'Windows 7';
    } else if (/Windows NT 6.0/i.test(userAgent)) {
        os = 'Windows Vista';
    } else if (/Windows/i.test(userAgent)) {
        os = 'Windows';
    } else if (/Mac OS X/i.test(userAgent)) {
        os = 'macOS';
    } else if (/Linux/i.test(userAgent)) {
        os = 'Linux';
    } else if (/Android/i.test(userAgent)) {
        os = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        os = 'iOS';
    }

    return {
        userAgent,
        deviceType,
        browser,
        os,
        ipAddress
    };
}

export function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
