import { ToolActionPayload, ContactItem } from '../types';
import { PhoneControlService } from './phoneControl';

export interface LocalCommandResult {
  isLocal: boolean;
  replyText: string;
  toolAction?: ToolActionPayload;
  intentType?: string;
  disambiguation?: {
    question: string;
    options: ContactItem[];
  };
}

export class CommandRouter {
  /**
   * Fast Local Intent Parser (Bilingual Hindi + English + Hinglish)
   */
  static parseLocalCommand(
    text: string,
    contacts: ContactItem[] = []
  ): LocalCommandResult {
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // 1. Alarm Command
    // e.g., "कल सुबह 6 बजे मुझे उठाना है", "set alarm for 7 am", "मेरे लिए 7 बजे का alarm लगाओ", "alarm 6:30"
    const alarmMatch =
      lower.match(/(?:alarm|अलार्म).*(?:for|at|को|का)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|बजे|सुबह|शाम)?/i) ||
      lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|बजे|सुबह|शाम)?\s*(?:का|पर)?\s*(?:alarm|अलार्म|उठाना)/i) ||
      lower.match(/(?:wake me up at|मुझे उठाओ)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

    if (alarmMatch && (lower.includes('alarm') || lower.includes('अलार्म') || lower.includes('उठा') || lower.includes('wake'))) {
      let hour = parseInt(alarmMatch[1], 10);
      const minute = alarmMatch[2] ? parseInt(alarmMatch[2], 10) : 0;
      const period = alarmMatch[3]?.toLowerCase();

      if (period === 'pm' || period === 'शाम' || (lower.includes('evening') && hour < 12)) {
        if (hour < 12) hour += 12;
      } else if ((period === 'am' || period === 'सुबह' || lower.includes('morning')) && hour === 12) {
        hour = 0;
      }

      const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const intentUri = `intent:#Intent;action=android.intent.action.SET_ALARM;S.android.intent.extra.MESSAGE=Lyra%20Alarm;i.android.intent.extra.HOUR=${hour};i.android.intent.extra.MINUTES=${minute};end`;

      return {
        isLocal: true,
        replyText: `ठीक है, मैंने ${timeFormatted} का अलार्म सेट कर दिया है. (Alarm scheduled for ${timeFormatted})`,
        intentType: 'alarm',
        toolAction: {
          toolName: 'AlarmTool',
          actionTitle: `Set Alarm for ${timeFormatted}`,
          params: { time: timeFormatted, label: 'Lyra Alarm', hour, minute },
          sensitive: false,
          status: 'executed',
          intentUri,
          resultDescription: `Alarm created for ${timeFormatted}.`,
        },
      };
    }

    // 2. Timer Command
    // e.g., "10 मिनट का timer", "5 minute timer", "set timer for 15 minutes"
    const timerMatch =
      lower.match(/(\d+)\s*(?:minute|min|मिनट|sec|second|सेकंड)\s*(?:का|for)?\s*timer/i) ||
      lower.match(/timer\s*(?:for)?\s*(\d+)\s*(?:minute|min|मिनट)/i);

    if (timerMatch) {
      const minutes = parseInt(timerMatch[1], 10);
      const totalSeconds = minutes * 60;

      return {
        isLocal: true,
        replyText: `मैंने ${minutes} मिनट का टाइमर शुरू कर दिया है. (${minutes}-minute countdown active)`,
        intentType: 'timer',
        toolAction: {
          toolName: 'TimerTool',
          actionTitle: `Start ${minutes} Min Timer`,
          params: { totalSeconds, label: `${minutes} Min Timer` },
          sensitive: false,
          status: 'executed',
          resultDescription: `${minutes}-minute timer active.`,
        },
      };
    }

    // 3. Camera Command
    // e.g., "Camera खोलो", "open camera", "take photo"
    if (lower.includes('camera') || lower.includes('कैमरा')) {
      if (lower.includes('open') || lower.includes('खोलो') || lower.includes('start') || lower.includes('launch')) {
        return {
          isLocal: true,
          replyText: 'कैमरा खोला जा रहा है. (Launching camera)',
          intentType: 'camera',
          toolAction: PhoneControlService.openCamera(),
        };
      }
    }

    // 4. Android Settings Command
    // e.g., "Settings खोलो", "open settings"
    if ((lower.includes('settings') || lower.includes('सेटिंग्स')) && (lower.includes('open') || lower.includes('खोलो'))) {
      return {
        isLocal: true,
        replyText: 'डिवाइस सेटिंग्स स्क्रीन खोली जा रही है. (Opening Android settings)',
        intentType: 'settings',
        toolAction: PhoneControlService.openSettings(),
      };
    }

    // 5. Browser / Chrome Launch
    // e.g., "Chrome खोलो", "open chrome", "browser खोलो"
    if (lower.includes('chrome खोलो') || lower.includes('open chrome') || lower.includes('ब्राउज़र खोलो') || lower.includes('open browser')) {
      return {
        isLocal: true,
        replyText: 'Chrome ब्राउज़र खोला जा रहा है. (Launching Chrome browser)',
        intentType: 'browser',
        toolAction: PhoneControlService.launchBrowser('https://www.google.com'),
      };
    }

    // 6. Direct Google Search Command
    // e.g., "Google पर NEXORA robotics search करो", "search on google for quantum computing"
    const searchMatch =
      lower.match(/(?:google|search)\s+(?:पर|for|on)?\s*(.+?)\s*(?:search करो|खोजो|ढूंढो|search)/i) ||
      lower.match(/search\s+(.+)/i);

    if (searchMatch && !lower.includes('call') && !lower.includes('alarm')) {
      const query = searchMatch[1].trim();
      return {
        isLocal: true,
        replyText: `Google पर "${query}" खोजा जा रहा है. (Searching Google for "${query}")`,
        intentType: 'browser_search',
        toolAction: PhoneControlService.launchBrowser(query),
      };
    }

    // 7. Navigation / Google Maps Command
    // e.g., "Google Maps खोलकर घर का रास्ता दिखाओ", "take me home", "navigate to airport", "मैप्स खोलो"
    if (lower.includes('map') || lower.includes('मैप') || lower.includes('रास्ता') || lower.includes('navigate')) {
      let dest = 'Home';
      if (lower.includes('घर') || lower.includes('home')) dest = 'Home';
      else {
        const destMatch = lower.match(/(?:navigate to|रास्ता दिखाओ|directions to)\s*(.+)/i);
        if (destMatch && destMatch[1]) dest = destMatch[1].trim();
      }

      return {
        isLocal: true,
        replyText: `Google Maps पर ${dest} का रास्ता तैयार कर रही हूँ. (Opening navigation for ${dest})`,
        intentType: 'maps',
        toolAction: PhoneControlService.openMapsNavigation(dest),
      };
    }

    // 8. Phone Call Command with Contact Disambiguation
    // e.g., "माँ को call करो", "Papa को call करो", "Call Rahul", "Call 9876543210"
    const callMatch =
      lower.match(/(?:call|कॉल)\s+(.+)/i) ||
      lower.match(/(.+?)\s*(?:को|पर)?\s*(?:call करो|कॉल करो)/i);

    if (callMatch && !lower.includes('weather') && !lower.includes('alarm')) {
      const targetQuery = callMatch[1].trim().replace(/(?:को|पर|my|my father|father|mother)$/i, '').trim();

      // Check if it's a numeric phone number
      const numOnly = targetQuery.replace(/[^0-9+]/g, '');
      if (numOnly.length >= 7) {
        return {
          isLocal: true,
          replyText: `क्या मैं ${numOnly} को कॉल करूँ? (Ready to place call to ${numOnly})`,
          intentType: 'call',
          toolAction: PhoneControlService.prepareCall(numOnly),
        };
      }

      // Check contacts list
      const matched = contacts.filter((c) =>
        c.name.toLowerCase().includes(targetQuery.toLowerCase()) ||
        (c.relationship && c.relationship.toLowerCase().includes(targetQuery.toLowerCase()))
      );

      if (matched.length === 1) {
        return {
          isLocal: true,
          replyText: `क्या मैं ${matched[0].name} (${matched[0].phone}) को कॉल करूँ?`,
          intentType: 'call',
          toolAction: PhoneControlService.prepareCall(matched[0].phone),
        };
      } else if (matched.length > 1) {
        return {
          isLocal: true,
          replyText: `मुझे ${matched.length} contacts मिले हैं: ${matched.map((m) => m.name).join(', ')}. आप किसे कॉल करना चाहते हैं?`,
          intentType: 'call_disambiguation',
          disambiguation: {
            question: `Which contact would you like to call?`,
            options: matched,
          },
        };
      } else if (targetQuery.length > 1) {
        return {
          isLocal: true,
          replyText: `क्या मैं "${targetQuery}" को कॉल करूँ?`,
          intentType: 'call',
          toolAction: PhoneControlService.prepareCall(targetQuery),
        };
      }
    }

    // 9. SMS Messaging Command
    // e.g., "Rahul को message भेजो कि मैं 10 मिनट में पहुँचूँगा", "Send SMS to 9876543210 Hello"
    const msgMatch =
      raw.match(/(.+?)\s*(?:को|to)?\s*(?:message|sms|मैसेज)\s*(?:भेजो|send)?\s*(?:कि|that|:)?\s*(.+)/i) ||
      raw.match(/(?:send message to|message)\s+(.+?)\s+(?:saying|that|:)?\s*(.+)/i);

    if (msgMatch) {
      const contactTarget = msgMatch[1].trim();
      const messageBody = msgMatch[2].trim();

      // Resolve contact
      let phoneNumber = contactTarget;
      const matchedContact = contacts.find(
        (c) =>
          c.name.toLowerCase().includes(contactTarget.toLowerCase()) ||
          (c.relationship && c.relationship.toLowerCase().includes(contactTarget.toLowerCase()))
      );

      if (matchedContact) {
        phoneNumber = matchedContact.phone;
      }

      return {
        isLocal: true,
        replyText: `${matchedContact?.name || phoneNumber} को मैसेज भेजने के लिए तैयार है: "${messageBody}". क्या मैं इसे भेज दूँ?`,
        intentType: 'message',
        toolAction: PhoneControlService.prepareSms(phoneNumber, messageBody),
      };
    }

    // Not a fast local command -> dispatch to AI Engine
    return {
      isLocal: false,
      replyText: '',
    };
  }
}
