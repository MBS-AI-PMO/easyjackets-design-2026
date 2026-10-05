import React from "react";
import axiosInstance from "../../utils/axiosConfig";
import UnderConstruction from "../UnderConstruction";

// The designer, or the holding page (components/UnderConstruction) in two cases:
//   - a deployment is running (backend /features/deployment-status, polled every few seconds); it comes
//     back by itself afterwards
//   - the site is under construction (admin: Settings → Site Status, backend /site-status). Only when the
//     builder is opened: someone already designing is never interrupted, and opening a cart design to
//     change it (?designedit=) is a purchase in progress and always allowed. The team's private preview
//     link (?preview=<key>, carried over from the storefront) opens it anyway. Switching it off opens the
//     designer without a reload: the holding page lifts away first.
// On localhost (development) the under-construction check is skipped; ?uc=1 shows the page there.
const POLL_INTERVAL_MS = 3000;
const SITE_CHECK_MS = 30 * 1000;
const LEAVE_MS = 600; // .ez-uc--leaving in components/UnderConstruction/holding.css
const TRANSACTION_LOCK_KEY = "easyjackets.transactionInProgress";
const PREVIEW_KEY = "ej-preview";
const STATUS_ERROR_GRACE_MS = 10 * 60 * 1000;
const DEFAULT_MESSAGE = "The site is under construction";

const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const onLocalhost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const showOnLocalhost = params.has("uc");
const editingCartDesign = params.has("designedit");

// keep (or with "off", forget) the preview key from the address
const takePreviewParam = () => {
  const value = params.get("preview");
  if (value === null) return;
  try {
    if (value && value !== "off") window.localStorage.setItem(PREVIEW_KEY, value);
    else window.localStorage.removeItem(PREVIEW_KEY);
  } catch (error) {
    // storage blocked: the preview lasts for this page only
  }
};
takePreviewParam();

const getPreviewKey = () => {
  try {
    return window.localStorage.getItem(PREVIEW_KEY) || params.get("preview") || "";
  } catch (error) {
    return params.get("preview") || "";
  }
};

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
  // the site status: null until the first answer
  const [site, setSite] = React.useState(null);
  const [siteUnreachable, setSiteUnreachable] = React.useState(false);
  // once the designer has been shown, under construction no longer closes it
  const [designing, setDesigning] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

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

  const refreshSite = React.useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/site-status", { timeout: 5000, params: { preview: getPreviewKey() } });
      setSite({
        underConstruction: Boolean(data?.underConstruction),
        message: String(data?.message || ""),
        preview: Boolean(data?.preview),
      });
      setSiteUnreachable(false);
    } catch (error) {
      setSiteUnreachable(true);
    }
  }, []);

  React.useEffect(() => {
    refreshStatus();
    const intervalId = window.setInterval(refreshStatus, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [refreshStatus]);

  React.useEffect(() => {
    if (onLocalhost) return undefined;
    refreshSite();
    const intervalId = window.setInterval(refreshSite, SITE_CHECK_MS);
    return () => window.clearInterval(intervalId);
  }, [refreshSite]);

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

  const inTransaction = transactionLocked || editingCartDesign;
  const siteBlocked = onLocalhost
    ? showOnLocalhost
    : !designing && !inTransaction && (site ? site.underConstruction && !site.preview : siteUnreachable);
  const siteWaiting = !onLocalhost && !designing && !inTransaction && !site && !siteUnreachable;
  const deployBlocked = deploymentStatus.active && !transactionLocked;
  const showDesigner = !siteBlocked && !siteWaiting && !deployBlocked;

  // the designer has been shown: from now on it stays (someone is designing)
  React.useEffect(() => {
    if (showDesigner && !leaving) setDesigning(true);
  }, [showDesigner, leaving]);

  // the site opening while the holding page shows: let it lift away first
  const wasSiteBlocked = React.useRef(siteBlocked);
  React.useEffect(() => {
    const opened = wasSiteBlocked.current && !siteBlocked;
    wasSiteBlocked.current = siteBlocked;
    if (!opened) return undefined;
    setLeaving(true);
    const timer = window.setTimeout(() => setLeaving(false), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [siteBlocked]);

  if (deployBlocked) {
    return <UnderConstruction mode="deploy" message={deploymentStatus.message} />;
  }
  if (siteWaiting) return <div style={{ minHeight: "100vh" }} />;
  if (siteBlocked || leaving) {
    return <UnderConstruction mode="site" message={site?.message} leaving={leaving && !siteBlocked} />;
  }

  return children;
};

export default MaintenanceGate;
