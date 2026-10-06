import { ToolActionPayload } from '../types';

export class PhoneControlService {
  /**
   * Safely dispatches an Android URL scheme or Intent
   */
  static dispatchIntent(uri: string): { success: boolean; message: string } {
    try {
      // In mobile web/Android webview or PWA, window.location.href triggers native handler
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (uri.startsWith('tel:') || uri.startsWith('sms:') || uri.startsWith('mailto:')) {
        window.location.href = uri;
        return {
          success: true,
          message: `Dispatched Android dialer/messaging scheme: ${uri}`,
        };
      }

      if (uri.startsWith('intent:')) {
        // Attempt opening intent or fallback gracefully
        try {
          window.location.href = uri;
          return {
            success: true,
            message: `Sent Android Intent: ${uri.slice(0, 40)}...`,
          };
        } catch {
          return {
            success: false,
            message: `Android Intent blocked by browser security sandbox.`,
          };
        }
      }

      // External web links (Maps, Chrome search, etc.)
      const newWin = window.open(uri, '_blank');
      if (newWin) {
        return {
          success: true,
          message: `Opened target screen: ${uri}`,
        };
      } else {
        window.location.href = uri;
        return {
          success: true,
          message: `Navigated to: ${uri}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to dispatch intent: ${err?.message || 'Security restriction'}`,
      };
    }
  }

  /**
   * Generates Android Call Intent / URI
   */
  static prepareCall(phoneNumber: string): ToolActionPayload {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const intentUri = `tel:${cleanNumber}`;
    return {
      toolName: 'CallTool',
      actionTitle: `Call ${phoneNumber}`,
      params: { phoneNumber: cleanNumber },
      sensitive: true,
      status: 'pending_confirmation',
      intentUri,
      resultDescription: `Ready to initiate phone call to ${cleanNumber}. Tap 'Call Now' to confirm.`,
    };
  }

  /**
   * Generates Android SMS Intent / URI
   */
  static prepareSms(phoneNumber: string, messageText: string): ToolActionPayload {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const intentUri = `sms:${cleanNumber}?body=${encodeURIComponent(messageText)}`;
    return {
      toolName: 'MessageTool',
      actionTitle: `Send SMS to ${phoneNumber}`,
      params: { phoneNumber: cleanNumber, messageText },
      sensitive: true,
      status: 'pending_confirmation',
      intentUri,
      resultDescription: `Prepared message: "${messageText}" for ${cleanNumber}. Tap 'Send Now' to dispatch.`,
    };
  }

  /**
   * Open Camera
   */
  static openCamera(): ToolActionPayload {
    const intentUri = 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end';
    return {
      toolName: 'CameraTool',
      actionTitle: 'Launch Camera',
      params: {},
      sensitive: false,
      status: 'executed',
      intentUri,
      resultDescription: 'Camera interface triggered via Android Media Capture.',
    };
  }

  /**
   * Open Android Settings
   */
  static openSettings(settingType: string = 'general'): ToolActionPayload {
    const intentUri = 'intent:#Intent;action=android.settings.SETTINGS;end';
    return {
      toolName: 'SettingsTool',
      actionTitle: `Open Device Settings (${settingType})`,
      params: { settingType },
      sensitive: false,
      status: 'executed',
      intentUri,
      resultDescription: 'Triggered Android Settings screen intent.',
    };
  }

  /**
   * Google Maps Navigation
   */
  static openMapsNavigation(destination: string): ToolActionPayload {
    const intentUri = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    return {
      toolName: 'MapsTool',
      actionTitle: `Navigate to ${destination}`,
      params: { destination },
      sensitive: false,
      status: 'executed',
      intentUri,
      resultDescription: `Opening Google Maps turn-by-turn navigation for ${destination}.`,
    };
  }

  /**
   * Browser Launch / Search
   */
  static launchBrowser(queryOrUrl: string): ToolActionPayload {
    const isUrl = /^https?:\/\//i.test(queryOrUrl) || queryOrUrl.includes('.com') || queryOrUrl.includes('.org');
    const targetUrl = isUrl
      ? (queryOrUrl.startsWith('http') ? queryOrUrl : `https://${queryOrUrl}`)
      : `https://www.google.com/search?q=${encodeURIComponent(queryOrUrl)}`;

    return {
      toolName: 'BrowserTool',
      actionTitle: isUrl ? `Open ${queryOrUrl}` : `Search "${queryOrUrl}"`,
      params: { targetUrl },
      sensitive: false,
      status: 'executed',
      intentUri: targetUrl,
      resultDescription: `Dispatched browser launch for: ${targetUrl}`,
    };
  }
}
