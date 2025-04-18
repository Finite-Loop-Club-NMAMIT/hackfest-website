import { useState } from "react";
import { api } from "~/utils/api";
import { Card, CardContent } from "~/components/ui/card";
import { Switch } from "@headlessui/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

export const ResultsVisibilityToggle = () => {
  const utils = api.useContext();
  const { data: appSettings } = api.appSettings.getAppSettings.useQuery();

  // Loading states for each toggle
  const [loadingStates, setLoadingStates] = useState({
    results: false,
    registration: false,
    payment: false,
    profileEdit: false,
    top60Validated: false,
    eventStarted: false,
    winnersDeclared: false,
    hackfestStarted: false,
    chatRooms: false,
  });

  type ToggleKey = keyof typeof loadingStates;

  // Setting up mutations for each toggle
  const resultsMutation = api.appSettings.setResultVisibility.useMutation({
    onMutate: () => updateLoadingState("results", true),
    onSuccess: handleSuccess("Results visibility updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("results", false),
  });

  const registrationMutation = api.appSettings.setRegistrationStatus.useMutation({
    onMutate: () => updateLoadingState("registration", true),
    onSuccess: handleSuccess("Registration status updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("registration", false),
  });

  const paymentMutation = api.appSettings.setPaymentStatus.useMutation({
    onMutate: () => updateLoadingState("payment", true),
    onSuccess: handleSuccess("Payment status updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("payment", false),
  });

  const profileEditMutation = api.appSettings.setProfileEditStatus.useMutation({
    onMutate: () => updateLoadingState("profileEdit", true),
    onSuccess: handleSuccess("Profile edit status updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("profileEdit", false),
  });

  const top60Mutation = api.appSettings.setTop60ValidationStatus.useMutation({
    onMutate: () => updateLoadingState("top60Validated", true),
    onSuccess: handleSuccess("Top 60 validation status updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("top60Validated", false),
  });

  const eventMutation = api.appSettings.setEventStatus.useMutation({
    onMutate: () => updateLoadingState("eventStarted", true),
    onSuccess: handleSuccess("Event status updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("eventStarted", false),
  });

  const winnersMutation = api.appSettings.setWinnersDeclaredStatus.useMutation({
    onMutate: () => updateLoadingState("winnersDeclared", true),
    onSuccess: handleSuccess("Winners declared status updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("winnersDeclared", false),
  });

  const hackfestStartMutation = api.appSettings.setHackfestStartTime.useMutation({
    onMutate: () => updateLoadingState("hackfestStarted", true),
    onSuccess: handleSuccess("Hackfest start time updated"),
    onError: handleError,
    onSettled: () => updateLoadingState("hackfestStarted", false),
  });

  const createChatRoomsMutation = api.appSettings.createChatRooms.useMutation({
    onMutate: () => updateLoadingState("chatRooms", true),
    onSuccess: () => {
      toast("Chat rooms created successfully");
      updateLoadingState("chatRooms", false);
    },
    onError: (error) => {
      toast(error.message || "Failed to create chat rooms");
      updateLoadingState("chatRooms", false);
    },
  });

  // Helper functions
  function updateLoadingState(key: ToggleKey, value: boolean): void {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }

  function handleSuccess(message: string) {
    return async () => {
      await utils.appSettings.getAppSettings.invalidate();
      toast(message);
    };
  }

  function handleError() {
    toast("Failed to update settings");
  }

  // Toggle handlers
  const toggleSetting = {
    results: () => resultsMutation.mutate(!appSettings?.isResultOpen),
    registration: () => registrationMutation.mutate(!appSettings?.isRegistrationOpen),
    payment: () => paymentMutation.mutate(!appSettings?.isPaymentOpen),
    profileEdit: () => profileEditMutation.mutate(!appSettings?.isProfileEditOpen),
    top60: () => top60Mutation.mutate(!appSettings?.isTop60Validated),
    event: () => eventMutation.mutate(!appSettings?.isEventStarted),
    winners: () => winnersMutation.mutate(!appSettings?.isWinnersDeclared),
    hackfest: () => hackfestStartMutation.mutate(appSettings?.isHackfestStarted ? false : true),
  };

  if (!appSettings) return <div>Loading settings...</div>;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="mb-6 text-2xl font-bold">Application Settings</h2>
        
        <div className="space-y-6">
          {/* Results Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Results Visibility</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isResultOpen ? "Results are visible to participants" : "Results are hidden from participants"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isResultOpen || false}
                onChange={toggleSetting.results}
                disabled={loadingStates.results}
                className={`${
                  appSettings.isResultOpen ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle results visibility</span>
                <span
                  className={`${
                    appSettings.isResultOpen ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.results ? "Updating..." : appSettings.isResultOpen ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>
          
          {/* Registration */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Registration</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isRegistrationOpen ? "Registration is open" : "Registration is closed"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isRegistrationOpen || false}
                onChange={toggleSetting.registration}
                disabled={loadingStates.registration}
                className={`${
                  appSettings.isRegistrationOpen ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle registration status</span>
                <span
                  className={`${
                    appSettings.isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.registration ? "Updating..." : appSettings.isRegistrationOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
          
          {/* Payment */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Payment</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isPaymentOpen ? "Payment is open" : "Payment is closed"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isPaymentOpen || false}
                onChange={toggleSetting.payment}
                disabled={loadingStates.payment}
                className={`${
                  appSettings.isPaymentOpen ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle payment status</span>
                <span
                  className={`${
                    appSettings.isPaymentOpen ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.payment ? "Updating..." : appSettings.isPaymentOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
          
          {/* Profile Edit */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Profile Editing</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isProfileEditOpen ? "Profile editing is enabled" : "Profile editing is disabled"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isProfileEditOpen || false}
                onChange={toggleSetting.profileEdit}
                disabled={loadingStates.profileEdit}
                className={`${
                  appSettings.isProfileEditOpen ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle profile edit status</span>
                <span
                  className={`${
                    appSettings.isProfileEditOpen ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.profileEdit ? "Updating..." : appSettings.isProfileEditOpen ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          
          {/* Top 60 Validated */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Top 60 Validation</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isTop60Validated ? "Top 60 are validated" : "Top 60 are not validated"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isTop60Validated || false}
                onChange={toggleSetting.top60}
                disabled={loadingStates.top60Validated}
                className={`${
                  appSettings.isTop60Validated ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle top 60 validation status</span>
                <span
                  className={`${
                    appSettings.isTop60Validated ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.top60Validated ? "Updating..." : appSettings.isTop60Validated ? "Validated" : "Not Validated"}
              </span>
            </div>
          </div>
          
          {/* Event Started */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Event Status</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isEventStarted ? "Event has started" : "Event has not started"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isEventStarted || false}
                onChange={toggleSetting.event}
                disabled={loadingStates.eventStarted}
                className={`${
                  appSettings.isEventStarted ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle event status</span>
                <span
                  className={`${
                    appSettings.isEventStarted ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.eventStarted ? "Updating..." : appSettings.isEventStarted ? "Started" : "Not Started"}
              </span>
            </div>
          </div>
          
          {/* Winners Declared */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Winners Status</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isWinnersDeclared ? "Winners have been declared" : "Winners have not been declared"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={appSettings.isWinnersDeclared || false}
                onChange={toggleSetting.winners}
                disabled={loadingStates.winnersDeclared}
                className={`${
                  appSettings.isWinnersDeclared ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle winners declared status</span>
                <span
                  className={`${
                    appSettings.isWinnersDeclared ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.winnersDeclared ? "Updating..." : appSettings.isWinnersDeclared ? "Declared" : "Not Declared"}
              </span>
            </div>
          </div>

          {/* Hackfest Start Time */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Hackfest Timer</h3>
              <p className="text-sm text-gray-500">
                {appSettings.isHackfestStarted 
                  ? `Hackfest timer started at ${appSettings.isHackfestStarted.toLocaleString()}` 
                  : "Hackfest timer not started"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!appSettings.isHackfestStarted}
                onChange={toggleSetting.hackfest}
                disabled={loadingStates.hackfestStarted}
                className={`${
                  appSettings.isHackfestStarted ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle hackfest timer</span>
                <span
                  className={`${
                    appSettings.isHackfestStarted ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm">
                {loadingStates.hackfestStarted ? "Updating..." : appSettings.isHackfestStarted ? "Started" : "Not Started"}
              </span>
            </div>
          </div>

          {/* Create Chat Rooms */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Team Chat Rooms</h3>
                <p className="text-sm text-gray-500">
                  Create chat rooms for all teams that have attended the event. Each room will include team members and all admin users.
                </p>
              </div>
              <Button
                onClick={() => createChatRoomsMutation.mutate()}
                disabled={loadingStates.chatRooms}
                variant="default"
                className="min-w-[120px]"
              >
                {loadingStates.chatRooms ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Chat Rooms"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
