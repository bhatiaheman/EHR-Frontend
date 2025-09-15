export const logoutApi = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 300);
  });
};