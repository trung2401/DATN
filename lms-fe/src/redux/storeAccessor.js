let store = null;

export const setStore = (reduxStore) => {
  store = reduxStore;
};

export const getStore = () => {
  if (!store) {
    throw new Error("Redux store is not initialized");
  }
  return store;
};