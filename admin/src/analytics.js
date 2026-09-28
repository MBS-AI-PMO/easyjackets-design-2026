import ReactGA from "react-ga4";

let isInitialized = false;

export const initGA = (measurementId) => {
    if (!measurementId || isInitialized) return false;

    ReactGA.initialize(measurementId);
    isInitialized = true;
    console.log("GA Initialized");
    return true;
};

export const trackPageView = (path) => {
    if (!isInitialized) return;
    ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category, action, label) => {
    if (!isInitialized) return;
    ReactGA.event({
        category,
        action,
        label,
    });
};
