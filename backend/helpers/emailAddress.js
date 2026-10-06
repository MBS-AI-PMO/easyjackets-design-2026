// One plain email address. Forms that make the shop send an email check the visitor's address with this:
// a comma-separated list or an array would have the same email sent to many people at once.
export const isOneEmail = (value) =>
  typeof value === 'string'
  && value.trim().length <= 254
  && /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/.test(value.trim());
