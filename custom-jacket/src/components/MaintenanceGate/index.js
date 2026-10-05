import React from "react";
import axiosInstance from "../../utils/axiosConfig";
import UnderConstruction from "../UnderConstruction";

// The designer, or the "under construction" screen (components/UnderConstruction) while one of the four
// apps is being deployed (backend /site-status: each app's Coolify pre- and post-deployment commands report
// the start and the end). Checked on load and every CHECK_MS; when the deployment is over the screen lifts
// away and the designer opens, without a reload. If the API cannot be reached (the backend itself being
// deployed), the screen shows on a first load, and an answer already given stays.
// A purchase in progress is never interrupted: someone already designing keeps the designer, and opening a
// cart design to change it (?designedit=) or a purchase marked in progress always opens it.
// On localhost (development) the check is skipped; ?uc=1 shows the screen there.
const CHECK_MS = 10 * 1000;
const LEAVE_MS = 600; // .ez-uc--leaving in components/UnderConstruction/holding.css
const TRANSACTION_LOCK_KEY = "easyjackets.transactionInProgress";

const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const onLocalhost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const showOnLocalhost = params.has("uc");
const editingCartDesign = params.has("designedit");

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
  // the answer: null until the first one
  const [status, setStatus] = React.useState(null);
  const [unreachable, setUnreachable] = React.useState(false);
  const [transactionLocked, setTransactionLocked] = React.useState(isTransactionLocked);
  // once the designer has been shown, a deployment no longer closes it
  const [designing, setDesigning] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/site-status", { timeout: 5000 });
      setStatus({ underConstruction: Boolean(data?.underConstruction), message: String(data?.message || "") });
      setUnreachable(false);
    } catch (error) {
      setUnreachable(true);
    } finally {
      setTransactionLocked(isTransactionLocked());
    }
  }, []);

  React.useEffect(() => {
    if (onLocalhost) return undefined;
    refresh();
    const intervalId = window.setInterval(refresh, CHECK_MS);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

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

  const inTransaction = designing || transactionLocked || editingCartDesign;
  const blocked = onLocalhost
    ? showOnLocalhost
    : !inTransaction && (status ? status.underConstruction : unreachable);
  const waiting = !onLocalhost && !inTransaction && !status && !unreachable;
  const showDesigner = !blocked && !waiting;

  // the designer has been shown: from now on it stays (someone is designing)
  React.useEffect(() => {
    if (showDesigner && !leaving && !onLocalhost) setDesigning(true);
  }, [showDesigner, leaving]);

  // the deployment over while the screen shows: let it lift away first
  const wasBlocked = React.useRef(blocked);
  React.useEffect(() => {
    const opened = wasBlocked.current && !blocked;
    wasBlocked.current = blocked;
    if (!opened) return undefined;
    setLeaving(true);
    const timer = window.setTimeout(() => setLeaving(false), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  if (waiting) return <div style={{ minHeight: "100vh" }} />;
  if (blocked || leaving) {
    return <UnderConstruction message={status?.message} leaving={leaving && !blocked} />;
  }

  return children;
};

export default MaintenanceGate;
