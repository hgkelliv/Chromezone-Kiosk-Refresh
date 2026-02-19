
export type ViewState = 'HOME' | 'TROUBLESHOOT' | 'LOANER' | 'TICKET' | 'SUCCESS' | 'AI_CHAT';

export interface FlowOption {
  label: string;
  nextStepId: string | null; // null implies end of flow/success
  variant: 'primary' | 'secondary' | 'outline' | 'danger';
  icon?: string;
}

export interface FlowStep {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string; // Image or Video placeholder
  mediaType?: 'image' | 'video';
  options: FlowOption[];
  isTicketPrompt?: boolean; // If true, this step is leading to a ticket submission
}

export interface TroubleshootingFlow {
  id: string;
  title: string;
  icon: string;
  startStepId: string;
  steps: Record<string, FlowStep>;
}

export interface LoanerState {
  mode: 'borrow' | 'return' | null;
  step: number;
  selectedDevice: string | null;
  studentId: string;
}

export interface LoanerDevice {
  id: string;
  name: string;
  status: 'available' | 'unavailable';
  batteryLevel: number;
}

// API Types
export interface ApiDevice {
  assetTag: string;
  rowIndex: number;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
}

export interface ApiAvailableResponse extends ApiResponse {
  devices: ApiDevice[];
  count: number;
}

export interface ApiCheckoutResponse extends ApiResponse {
  assetTag: string;
  borrowerName: string;
  checkoutTime: string;
}

export interface ApiReturnResponse extends ApiResponse {
  assetTag: string;
  returnedBy: string;
  returnTime: string;
}