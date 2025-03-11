/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Component for tracking user page visits and analytics
 * Handles:
 * - Page visit logging
 * - Visit duration tracking
 * - Device type detection 
 * - Timer synchronization
 */

import { useEffect, useRef, useCallback } from "react";
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
  const currentPathRef = useRef<string | null>(null);
  const { data: session } = useSession();
  const session_user = session?.user.email?.toLowerCase() ?? null;

  // Determine device type once outside of effects
  const deviceType = (() => {
    if (typeof window === 'undefined') return null;
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    if (isDesktop) return "desktop";
    return "unknown";
  })();

  // Memoize the update visit function to avoid dependency issues
  const updateVisit = useCallback(() => {
    if (uniqueIdRef.current) {
      updateVisitMutation.mutate({
        uniqueId: uniqueIdRef.current,
        timer: timerRef.current,
      });
    }
  }, []);

  // Memoize the sync timer function
  const syncTimer = useCallback(() => {
    if (uniqueIdRef.current) {
      syncTimerMutation.mutate({
        uniqueId: uniqueIdRef.current,
        timer: timerRef.current,
      });
    }
  }, []);

  // Monitor path changes to trigger visit logging
  useEffect(() => {
    // Skip if we don't have a valid session or device yet
    if (!deviceType) return;
    
    const currentPath = router.asPath;
    const allowedPaths = ["/contact", "/about", "/profile", "/register", "/timeline"];
    const isAllowedPath = currentPath === "/" || allowedPaths.some((path) => currentPath.startsWith(path));
    
    // Only proceed if it's an allowed path and different from the current one
    if (isAllowedPath && currentPath !== currentPathRef.current) {
      currentPathRef.current = currentPath;
      
      // Clean up previous visit
      updateVisit();
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      
      // Create a new unique ID for this visit
      const uniqueId = generateUniqueId();
      uniqueIdRef.current = uniqueId;
      
      // Update null entries first
      updateNullEntriesMutation.mutate({ session_user }, {
        onSuccess: () => {
          // Then log the new visit
          logVisitMutation.mutate(
            { session_user, uniqueId, routePath: currentPath, device: deviceType }, 
            { onError: (error) => console.error("Error logging visit:", error) }
          );
        },
        onError: (error) => console.error("Error updating null entries:", error),
      });
      
      // Reset and start timer
      timerRef.current = 0;
      
      // Start visit duration timer
      intervalRef.current = setInterval(() => {
        timerRef.current++;
      }, 1000);
      
      // Sync timer every 20 seconds
      syncIntervalRef.current = setInterval(syncTimer, 20000);
    }
  }, [router.asPath, deviceType, session_user, syncTimer]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Handle cleanup
      updateVisit();
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [updateVisit]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateVisit();
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [updateVisit]);

  return null;
};

export default TrackPageVisits;
