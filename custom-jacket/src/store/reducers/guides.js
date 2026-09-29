let initState = { open: false, cookie: false, proceed: false };

const guideModal = (state = initState, { type, data }) => {
  switch (type) {
    case 'GUIDE_MODAL_STATE':
      if (data.val && data.key === 'cookie') {
        document.cookie =
          'cjdguidesshow=nah; expires=Sun, 1 Jan 2025 00:00:00 UTC; path=/';
      } else {
        document.cookie =
          'cjdguidesshow=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      }
      return {
        ...state,
        [data.key]: data.val,
      };

    default:
      return state;
  }
};

export default guideModal;
