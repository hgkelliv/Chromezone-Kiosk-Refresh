import { TroubleshootingFlow, LoanerDevice } from './types';

export const SCHOOL_LOGO_URL = "https://aptg.co/NBXZ7x";
export const APP_NAME = "Chromezone";
export const TICKET_URL = "https://airtable.com/appebVtuYEdmMqcn4/pagqIveB6XR6pqpEs/form";

// Google Apps Script Web App URL
export const LOANER_API_URL = "https://script.google.com/macros/s/AKfycbzAOjXvbz4TyvvNzTNIA67IpA2EuKU2-VHyRKD9kutlQ4hyzFm2uWbjAl_WKq6PCOTDTQ/exec"; 

// Mock Data for Loaner System (Fallback)
export const MOCK_DEVICES: LoanerDevice[] = [
  { id: 'CB-101', name: 'Dell 3100 (Cart A)', status: 'available', batteryLevel: 85 },
  { id: 'CB-102', name: 'Dell 3100 (Cart A)', status: 'available', batteryLevel: 100 },
  { id: 'CB-103', name: 'HP G8 (Cart B)', status: 'unavailable', batteryLevel: 12 },
  { id: 'CB-104', name: 'HP G8 (Cart B)', status: 'available', batteryLevel: 45 },
  { id: 'CB-105', name: 'Lenovo 100e', status: 'available', batteryLevel: 92 },
  { id: 'CB-106', name: 'Lenovo 100e', status: 'available', batteryLevel: 78 },
];

export const TROUBLESHOOTING_FLOWS: TroubleshootingFlow[] = [
  {
    id: 'signin',
    title: "Can't Sign In",
    icon: 'Lock',
    startStepId: 'verify_error_check',
    steps: {
      'verify_error_check': {
        id: 'verify_error_check',
        title: "Error Message Check",
        description: "Does your chromebook say \"can't verify password\" or \"enter your old password?\"",
        options: [
            { label: "Yes", nextStepId: 'remove_account_instructions', variant: 'primary' },
            { label: "No, something else", nextStepId: 'check_wifi', variant: 'secondary' }
        ]
      },
      'remove_account_instructions': {
        id: 'remove_account_instructions',
        title: "Remove Account & Restart",
        description: "Try this:\n\n1. From the sign-in screen, click on the account you want to remove.\n\n2. Look for the small \"down arrow\" next to the account name.\n\n3. If you see \"Remove this account\" — click it and click again to confirm.\n\n4. If you don't see that option, check the bottom left corner for a sign out button.\n\n5. Once complete, click Shut Down in the bottom left corner. Check for the white (or orange) LED light on the side of your chromebook and wait for it to fully turn off.\n\n6. Once it's off, Press the power button on your chromebook to turn it back on, and attempt to sign in again.",
        options: [
            { label: "This worked", nextStepId: null, variant: 'primary' },
            { label: "This didn't work", nextStepId: 'ec_reset_signin', variant: 'secondary' }
        ]
      },
      'ec_reset_signin': {
         id: 'ec_reset_signin',
         title: "Try an EC Reset",
         description: "Try one more thing:\n\nStep 1: Press the esc key, then the refresh key (circle with the arrow), and the power button all at the same time. The screen will go black.\n\nStep 2: You will see a screen that says \"Let's step you through the recovery process\". Press the power button on your chromebook again to power off your chromebook.\n\nStep 3: Finally, press the power button one more time to turn your chromebook on again and try to sign in again.",
         options: [
             { label: "That worked!", nextStepId: null, variant: 'primary' },
             { label: "That didn't work", nextStepId: 'ticket_submit', variant: 'danger' }
         ]
      },
      'check_wifi': {
        id: 'check_wifi',
        title: "Check Wi-Fi Connection",
        description: "Before we check your account, look at the bottom right of your screen. Is the Wi-Fi icon white or gray?",
        mediaUrl: "https://picsum.photos/800/400?grayscale", 
        mediaType: 'image',
        options: [
          { label: "It's connected (White)", nextStepId: 'check_password', variant: 'primary' },
          { label: "It's disconnected (Gray/Empty)", nextStepId: 'connect_wifi_instructions', variant: 'secondary' },
        ]
      },
      'connect_wifi_instructions': {
        id: 'connect_wifi_instructions',
        title: "Connect to Wi-Fi",
        description: "Click the time in the bottom right, select the Wi-Fi icon, and choose 'Somerville-Student'.",
        mediaUrl: "https://picsum.photos/800/400?blur",
        options: [
          { label: "I'm connected now", nextStepId: 'check_password', variant: 'primary' },
          { label: "Still won't connect", nextStepId: 'restart_device', variant: 'secondary' },
        ]
      },
      'check_password': {
        id: 'check_password',
        title: "Check Your Password",
        description: "Make sure 'Caps Lock' is off. Try typing your password slowly.",
        options: [
          { label: "It worked!", nextStepId: null, variant: 'primary' },
          { label: "Still can't sign in", nextStepId: 'restart_device', variant: 'secondary' },
        ]
      },
      'restart_device': {
        id: 'restart_device',
        title: "Restart Your Chromebook",
        description: "Hold the power button until the screen goes black, then press it again to turn it back on.",
        options: [
          { label: "It worked!", nextStepId: null, variant: 'primary' },
          { label: "Not fixed", nextStepId: 'ticket_submit', variant: 'danger' },
        ]
      },
      'ticket_submit': {
        id: 'ticket_submit',
        title: "Let's Get Help",
        description: "It looks like we can't fix this here. Please submit a ticket so a technician can help.",
        isTicketPrompt: true,
        options: [
          { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
        ]
      }
    }
  },
  {
    id: 'wifi',
    title: "Wi-Fi Issues",
    icon: 'Wifi',
    startStepId: 'restart_device',
    steps: {
      'restart_device': {
        id: 'restart_device',
        title: "Restart Device",
        description: "A simple restart fixes 90% of Wi-Fi issues. Have you tried turning it off and on again?",
        options: [
          { label: "Fixed it", nextStepId: null, variant: 'primary' },
          { label: "Still broken", nextStepId: 'ec_reset_wifi', variant: 'secondary' },
        ]
      },
      'ec_reset_wifi': {
        id: 'ec_reset_wifi',
        title: "Try an EC Reset",
        description: "Step 1: Press the esc key, then the refresh key (circle with the arrow), and the power button all at the same time. The screen will go black.\n\nStep 2: You will see a screen that says \"Let's step you through the recovery process\". Press the power button on your chromebook again to power off your chromebook.\n\nStep 3: Finally, press the power button one more time to turn your chromebook on again. See if your wifi is working again.",
        options: [
            { label: "It worked!", nextStepId: null, variant: 'primary' },
            { label: "Still not working", nextStepId: 'ticket_submit', variant: 'danger' }
        ]
      },
      'ticket_submit': {
        id: 'ticket_submit',
        title: "Hardware Issue",
        description: "This might be a hardware problem with the Wi-Fi card.",
        isTicketPrompt: true,
        options: [
          { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
        ]
      }
    }
  },
  {
    id: 'keyboard',
    title: "Keyboard Issues",
    icon: 'Keyboard',
    startStepId: 'assess_issue',
    steps: {
      'assess_issue': {
        id: 'assess_issue',
        title: "What is wrong with your keyboard?",
        description: "Please select the option that best describes the issue.",
        options: [
          { label: "Keys are not typing correctly", nextStepId: 'ec_reset_instructions', variant: 'primary' },
          { label: "Keys are hard to press", nextStepId: 'physical_damage', variant: 'secondary' },
          { label: "Keyboard is not showing up at all", nextStepId: 'ec_reset_instructions', variant: 'secondary' },
        ]
      },
      'ec_reset_instructions': {
        id: 'ec_reset_instructions',
        title: "Try an EC Reset",
        description: "If your keys are not typing correctly, please do the following steps:\n\nStep 1: Press the esc key, then the refresh key (circle with the arrow), and the power button all at the same time. The screen will go black.\n\nStep 2: You will see a screen that says \"Let's step you through the recovery process\". Press the power button on your chromebook again to power off your chromebook.\n\nStep 3: Finally, press the power button one more time to turn your chromebook on again. Try to login. Your keys should be typing as expected.",
        options: [
           { label: "That worked!", nextStepId: null, variant: 'primary' },
           { label: "That didn't work", nextStepId: 'ticket_submit', variant: 'danger' }
        ]
      },
      'physical_damage': {
        id: 'physical_damage',
        title: "Physical Damage",
        description: "Since the keys are hard to press, this is likely a physical hardware issue.",
        isTicketPrompt: true,
        options: [
          { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
        ]
      },
      'ticket_submit': {
        id: 'ticket_submit',
        title: "Hardware Repair",
        description: "The reset did not fix the keyboard issue. Please submit a ticket for repair.",
        isTicketPrompt: true,
        options: [
          { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
        ]
      }
    }
  },
  {
    id: 'screen',
    title: "Screen Issues",
    icon: 'MonitorX',
    startStepId: 'assess_damage',
    steps: {
        'assess_damage': {
            id: 'assess_damage',
            title: "Is it physically broken?",
            description: "Do you see cracks, bleeding ink, or lines on the screen?",
            options: [
                { label: "Yes, it's cracked", nextStepId: 'ticket_submit', variant: 'danger' },
                { label: "No, it's just glitching", nextStepId: 'hard_reset', variant: 'primary' }
            ]
        },
        'hard_reset': {
             id: 'hard_reset',
             title: "Hard Reset",
             description: "Hold Refresh + Power for 10 seconds.",
             options: [
                 { label: "Fixed", nextStepId: null, variant: 'primary' },
                 { label: "Still glitching", nextStepId: 'ticket_submit', variant: 'danger' }
             ]
        },
        'ticket_submit': {
            id: 'ticket_submit',
            title: "Screen Repair",
            description: "Please submit a ticket for screen replacement.",
            isTicketPrompt: true,
            options: [
                { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
            ]
        }
    }
  },
  {
    id: 'power',
    title: "Power Issues",
    icon: 'BatteryWarning',
    startStepId: 'check_charger',
    steps: {
        'check_charger': {
            id: 'check_charger',
            title: "Check Charger",
            description: "Plug in the charger. Does the light on the side turn on (Orange or White)?",
            options: [
                { label: "Light is ON", nextStepId: 'charge_wait', variant: 'primary' },
                { label: "Light is OFF", nextStepId: 'try_another_charger', variant: 'secondary' }
            ]
        },
        'charge_wait': {
            id: 'charge_wait',
            title: "Let it Charge",
            description: "If the battery was dead, it needs 15 minutes to charge before it will turn on.",
            options: [
                { label: "It turned on!", nextStepId: null, variant: 'primary' },
                { label: "Still won't turn on", nextStepId: 'ticket_submit', variant: 'danger' }
            ]
        },
        'try_another_charger': {
             id: 'try_another_charger',
             title: "Try Another Charger",
             description: "Borrow a friend's charger to see if your charger is broken.",
             options: [
                 { label: "Works with new charger", nextStepId: null, variant: 'primary' },
                 { label: "Still no light", nextStepId: 'ticket_submit', variant: 'danger' }
             ]
        },
        'ticket_submit': {
            id: 'ticket_submit',
            title: "Battery/Port Issue",
            description: "The charging port or battery likely needs replacement.",
            isTicketPrompt: true,
            options: [
                 { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
            ]
        }
    }
  },
  {
    id: 'tips',
    title: "Quick Tips",
    icon: 'Lightbulb',
    startStepId: 'shortcuts',
    steps: {
      'shortcuts': {
        id: 'shortcuts',
        title: "Useful Shortcuts",
        description: "Screenshot: Ctrl + Shift + Switch Window. Caps Lock: Alt + Search. Lock Screen: Search + L.",
        options: [
          { label: "Cool, thanks", nextStepId: null, variant: 'primary' },
          { label: "I have another issue", nextStepId: 'other_issue', variant: 'secondary' }
        ]
      },
      'other_issue': {
        id: 'other_issue',
        title: "Still need help?",
        description: "Try searching our knowledge base or ask the AI Assistant.",
        options: [
           { label: "Submit Ticket", nextStepId: 'TICKET_REDIRECT', variant: 'primary' }
        ]
      }
    }
  }
];