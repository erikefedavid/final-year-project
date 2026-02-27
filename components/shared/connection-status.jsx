"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, AlertTriangle } from "lucide-react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsSlow(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkSpeed = () => {
      if (navigator.connection) {
        const connection = navigator.connection;
        if (connection.effectiveType === "2g" || connection.effectiveType === "slow-2g") {
          setIsSlow(true);
        } else {
          setIsSlow(false);
        }
      }
    };

    checkSpeed();

    if (navigator.connection) {
      navigator.connection.addEventListener("change", checkSpeed);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (navigator.connection) {
        navigator.connection.removeEventListener("change", checkSpeed);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white py-3 px-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <p className="text-sm font-medium">
              No internet connection. Please check your network.
            </p>
          </div>
        </motion.div>
      )}

      {isOnline && isSlow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-black py-3 px-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">
              Slow internet detected. Some features may take longer.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}