export interface AppSettings {
  id: number;
  isResultOpen: boolean;
  isWinnersDeclared: boolean;
  isRegistrationOpen: boolean;
  isPaymentOpen: boolean;
  isVideoSubmissionOpen: boolean;
  isProfileEditOpen: boolean;
  isTop60Validated: boolean;
  isEventStarted: boolean;
  isHackfestStarted: Date | null;
}
