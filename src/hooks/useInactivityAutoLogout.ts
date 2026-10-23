import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseInactivityAutoLogoutOptions {
  timeoutMs?: number; // default: 15 minutes = 15 * 60 * 1000 = 900,000 ms
  warningBeforeMs?: number; // e.g. 60 seconds before timeout, show warning countdown
  enabled?: boolean;
  onLogout: (reason: 'inactivity') => void;
}

export interface InactivityState {
  remainingSeconds: number;
  isWarning: boolean;
  resetTimer: () => void;
}

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING_BEFORE_MS = 60 * 1000; // 60 seconds warning

export function useInactivityAutoLogout({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningBeforeMs = DEFAULT_WARNING_BEFORE_MS,
  enabled = true,
  onLogout,
}: UseInactivityAutoLogoutOptions): InactivityState {
  const lastActivityRef = useRef<number>(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(Math.floor(timeoutMs / 1000));
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const onLogoutRef = useRef(onLogout);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingSeconds(Math.floor(timeoutMs / 1000));
    setIsWarning(false);
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      setIsWarning(false);
      return;
    }

    // Reset timestamp on initialization / when enabled becomes true
    lastActivityRef.current = Date.now();
    setIsWarning(false);
    setRemainingSeconds(Math.floor(timeoutMs / 1000));

    // User activity events to listen to
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleUserActivity = () => {
      // Throttle updating if not yet close to warning to minimize re-renders
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      lastActivityRef.current = now;

      // If we were showing warning modal, user activity dismisses it and resets countdown
      if (isWarning || elapsed > 3000) {
        setIsWarning(false);
        const rem = Math.max(0, Math.floor((timeoutMs - (now - lastActivityRef.current)) / 1000));
        setRemainingSeconds(rem);
      }
    };

    // Attach listeners with passive flag for high performance
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Interval checker running every second
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const leftMs = timeoutMs - elapsed;
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));

      setRemainingSeconds(leftSec);

      if (leftMs <= 0) {
        // Time expired! Trigger logout
        clearInterval(interval);
        onLogoutRef.current('inactivity');
      } else if (leftMs <= warningBeforeMs) {
        setIsWarning(true);
      } else {
        setIsWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, timeoutMs, warningBeforeMs, isWarning]);

  return {
    remainingSeconds,
    isWarning,
    resetTimer,
  };
}
