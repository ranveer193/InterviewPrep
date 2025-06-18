export const validateEmail = (email) => {
  const regex = /^[0-9]{9}@nitkkr\.ac\.in$/;
  return regex.test(email);
};
