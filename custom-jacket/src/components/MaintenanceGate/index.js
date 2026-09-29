import React from "react";
import axiosInstance from "../../utils/axiosConfig";
import UnderConstruction from "../UnderConstruction";

const POLL_INTERVAL_MS = 3000;
const TRANSACTION_LOCK_KEY = "easyjackets.transactionInProgress";
const STATUS_ERROR_GRACE_MS = 10 * 60 * 1000;
const DEFAULT_MESSAGE = "The site is under construction";

const keepPreviousActiveDuringStatusError = (previous) => {
  if (!previous?.active || !previous?.activeSince) return false;
  return Date.now() - previous.activeSince <= STATUS_ERROR_GRACE_MS;
};

const isTransactionLocked = () => {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(TRANSACTION_LOCK_KEY);
    if (!raw) return false;

    const lock = JSON.parse(raw);
    if (!lock?.expiresAt || Number(lock.expiresAt) <= Date.now()) {
      window.localStorage.removeItem(TRANSACTION_LOCK_KEY);
      return false;
    }

    return true;
  } catch (error) {
    window.localStorage.removeItem(TRANSACTION_LOCK_KEY);
    return false;
  }
};

const MaintenanceGate = ({ children }) => {
  const [deploymentStatus, setDeploymentStatus] = React.useState({
    active: false,
    message: DEFAULT_MESSAGE,
    activeSince: null,
  });
  const [transactionLocked, setTransactionLocked] = React.useState(isTransactionLocked);

  const refreshStatus = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get("/features/deployment-status", { timeout: 5000 });
      const active = Boolean(response.data?.active);
      setDeploymentStatus({
        active,
        message: response.data?.message || DEFAULT_MESSAGE,
        activeSince: active ? Date.now() : null,
      });
    } catch (error) {
      setDeploymentStatus((previous) => {
        const active = keepPreviousActiveDuringStatusError(previous);
        return {
          active,
          message: previous?.message || DEFAULT_MESSAGE,
          activeSince: active ? previous.activeSince : null,
        };
      });
    } finally {
      setTransactionLocked(isTransactionLocked());
    }
  }, []);

  React.useEffect(() => {
    refreshStatus();
    const intervalId = window.setInterval(refreshStatus, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [refreshStatus]);

  React.useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === TRANSACTION_LOCK_KEY) {
        setTransactionLocked(isTransactionLocked());
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("easyjackets-transaction-state", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("easyjackets-transaction-state", handleStorage);
    };
  }, []);

  if (deploymentStatus.active && !transactionLocked) {
    return <UnderConstruction message={deploymentStatus.message} />;
  }

  return children;
};

export default MaintenanceGate;
