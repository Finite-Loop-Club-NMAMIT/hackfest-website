/**
 * Component for tracking user page visits and analytics
 * Handles:
 * - Page visit logging
 * - Visit duration tracking
 * - Device type detection 
 * - Timer synchronization
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { generateUniqueId } from "~/utils/generateUniqueId";
import { useSession } from "next-auth/react";
import { isMobile, isTablet, isDesktop } from "react-device-detect";

const TrackPageVisits = () => {
  // API mutation hooks for analytics operations
  const logVisitMutation = api.analytics.logVisit.useMutation();
  const updateVisitMutation = api.analytics.updateVisit.useMutation();
  const updateNullEntriesMutation = api.analytics.updateNullEntries.useMutation();
  const syncTimerMutation = api.analytics.updateVisit.useMutation();

  const router = useRouter();
  // Refs for tracking visit state
  const timerRef = useRef<number>(0);
  const uniqueIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const session_user = session?.user.email?.toLowerCase() ?? "";

  // State to track device readiness
  const [deviceType, setDeviceType] = useState<string | null>(null);

  // Device type detection effect
  useEffect(() => {
    // Device type detection logic
    const determineDeviceType = () => {
      if (isMobile) return "mobile";
      if (isTablet) return "tablet";
      if (isDesktop) return "desktop";
      return "unknown"; // Fallback
    };

    // Set device type once determined
    setDeviceType(determineDeviceType());
  }, []);

  // Main tracking logic effect
  useEffect(() => {
    // Ensure deviceType is determined before proceeding
    if (!deviceType) return;

    /**
     * Handles new page visit initialization
     * - Generates unique visit ID
     * - Updates null entries
     * - Starts visit timer
     * - Sets up sync intervals
     */
    const handlePageVisit = () => {
      const routePath = router.asPath;
      const allowedPaths = ["/contact", "/about", "/profile", "/register","/timeline"];
      const isAllowedPath = routePath === "/" || allowedPaths.some((path) => routePath.startsWith(path));

      if (!isAllowedPath) return;
      
      const uniqueId = generateUniqueId();
      uniqueIdRef.current = uniqueId;

      // First, update null entries
      updateNullEntriesMutation.mutate(
        { session_user },
        {
          onSuccess: () => {
            // Log visit once null entries are updated
            logVisitMutation.mutate(
              { session_user, uniqueId, routePath, device: deviceType }, 
              {
                onError: (error) => console.error("Error logging visit:", error),
              }
            );
          },
          onError: (error) => console.error("Error updating null entries:", error),
        }
      );

      timerRef.current = 0;

      // Clear any existing intervals
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

      // Start visit duration timer
      intervalRef.current = setInterval(() => {
        timerRef.current++;
      }, 1000);

      // Sync timer every 20 seconds
      syncIntervalRef.current = setInterval(() => {
        if (uniqueIdRef.current) {
          syncTimerMutation.mutate({
            uniqueId: uniqueIdRef.current,
            timer: timerRef.current,
          });
        }
      }, 20000);
    };

    /**
     * Handles cleanup on page exit
     * - Updates final visit duration
     * - Clears intervals
     */
    const handlePageExit = () => {
      // Handle page exit logic
      if (uniqueIdRef.current) {
        updateVisitMutation.mutate({
          uniqueId: uniqueIdRef.current,
          timer: timerRef.current,
        });
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };

    // Event listener setup and cleanup
    if (document.readyState === "complete") {
      handlePageVisit();
    } else {
      window.addEventListener("load", handlePageVisit);
    }

    window.addEventListener("beforeunload", handlePageExit);
    return () => {
      // Cleanup
      handlePageExit();
      window.removeEventListener("load", handlePageVisit);
      window.removeEventListener("beforeunload", handlePageExit);
    };
  }, [
    router.asPath, 
    deviceType, 
    logVisitMutation, 
    session_user, 
    syncTimerMutation,
    updateNullEntriesMutation,
    updateVisitMutation
  ]); // Include all dependencies used inside the effect

  return null;
};

export default TrackPageVisits;
