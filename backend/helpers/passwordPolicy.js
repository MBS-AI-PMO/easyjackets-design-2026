// One password rule for every place a password is set: sign-up, admin creation, reset, change and profile.
// (Sign-up and admin creation used to take any password, one character included; the others asked for 6.)
//   - customers: at least MIN_LENGTH characters; admins: at least ADMIN_MIN_LENGTH (an admin login controls
//     payments, emails and every order)
//   - not one of the passwords attackers try first (COMMON), not the email's own name, not one repeated character
//   - at most MAX_LENGTH: bcrypt only reads the first 72 bytes, so longer adds nothing
// Existing passwords keep working; the rule applies when a password is set.
export const MIN_LENGTH = 8;
export const ADMIN_MIN_LENGTH = 12;
const MAX_LENGTH = 128;

// The most common passwords of 8+ characters in breach lists, plus the shop's own name and products.
const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'pa$$word',
  '12345678', '123456789', '1234567890', '12341234', '11111111', '00000000', '88888888', '87654321', '123123123',
  '1q2w3e4r', '1q2w3e4r5t', '1qaz2wsx', 'zaq12wsx', 'q1w2e3r4', 'qwertyui', 'qwerty123', 'qwerty12', 'qwertyuiop',
  'qwe12345', '123qweasd', 'asdfghjk', 'asdfghjkl', 'zxcvbnm1', 'aa123456', 'abc12345', 'abcd1234', 'abcdefgh',
  'iloveyou', 'iloveyou1', 'sunshine', 'princess', 'football', 'baseball', 'basketball', 'superman', 'starwars',
  'whatever', 'welcome1', 'welcome123', 'letmein1', 'trustno1', 'monkey123', 'dragon123', 'shadow123', 'master123',
  'freedom1', 'michael1', 'jennifer', 'computer', 'internet', 'administrator', 'admin123', 'admin1234', 'adminadmin',
  'changeme', 'changeme1', 'secret123', 'default1', 'pakistan', 'pakistan1', 'pakistan123', 'lahore123', 'karachi123',
  'easyjackets', 'easyjacket', 'easyjackets1', 'easyjackets123', 'easyjacket123', 'varsity1', 'varsityjacket',
  'jacket123', 'jackets123', 'letterman', 'letterman1',
]);

/**
 * The reason a new password is refused, or null when it is fine.
 * @param {unknown} password
 * @param {{ email?: string, admin?: boolean }} [options]
 */
export const passwordProblem = (password, { email = '', admin = false } = {}) => {
  if (typeof password !== 'string' || !password) return 'Please enter a password.';
  const min = admin ? ADMIN_MIN_LENGTH : MIN_LENGTH;
  if (password.length < min) return `Use a password of at least ${min} characters.`;
  if (password.length > MAX_LENGTH) return `Use a password of at most ${MAX_LENGTH} characters.`;
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) return 'That password is too common. Please choose another.';
  if (/^(.)\1+$/.test(password)) return 'Please choose a password that is not one repeated character.';
  const name = String(email || '').split('@')[0].toLowerCase();
  if (name.length >= 4 && lower === name) return 'Please choose a password that is not your email address.';
  return null;
};
