export const allowedDomain = "@nitkkr.ac.in";

export function isAllowedEmail(email = "") {
  return email.toLowerCase().endsWith(allowedDomain);
}
