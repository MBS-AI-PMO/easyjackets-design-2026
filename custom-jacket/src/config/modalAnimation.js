// How long a modal takes to fade/scale out. react-modal keeps the dialog mounted for
// exactly this long after a close is requested, and the matching transitions live on
// .cjd-modal / .cjd-modal-overlay in css/App.scss - change one and change the other, or
// the dialog is torn out of the DOM part way through its exit.
export const MODAL_ANIM_MS = 220;
