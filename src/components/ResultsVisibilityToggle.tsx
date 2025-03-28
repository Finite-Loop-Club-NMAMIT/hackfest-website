import { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export const ResultsVisibilityToggle = () => {
  const utils = api.useContext();
  const { data: appSettings } = api.appSettings.getAppSettings.useQuery();
  const isResultOpen = Boolean(appSettings?.isResultOpen);
  const [isLoading, setIsLoading] = useState(false);
  
  const setResultVisibility = api.appSettings.setResultVisibility.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: async () => {
      await utils.appSettings.getAppSettings.invalidate();
      // Use alert instead of toast since toast is not available
      alert(`Results are now ${!isResultOpen ? "visible" : "hidden"} to participants`);
    },
    onError: () => {
      alert("Failed to update results visibility");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleToggle = () => {
    setResultVisibility.mutate(!isResultOpen);
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-lg font-medium">Results Visibility</h3>
          <p className="text-sm text-gray-500">
            {isResultOpen ? "Results are currently visible to participants" : "Results are currently hidden from participants"}
          </p>
        </div>
        <Button 
          onClick={handleToggle}
          disabled={isLoading}
          variant={isResultOpen ? "destructive" : "default"}
        >
          {isLoading ? "Updating..." : isResultOpen ? "Hide Results" : "Show Results"}
        </Button>
      </CardContent>
    </Card>
  );
};
