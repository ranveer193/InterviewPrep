export const allowedDomain = "";      
export function isAllowedEmail(email = "") {
  return allowedDomain && email.toLowerCase().endsWith(allowedDomain);
}
