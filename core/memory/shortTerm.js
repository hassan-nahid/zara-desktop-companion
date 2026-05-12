export const createShortTermMemory = (limit = 20) => {
  const history = [];

  return {
    add(message) {
      history.push(message);
      if (history.length > limit) {
        history.shift();
      }
    },
    list() {
      return [...history];
    },
    clear() {
      history.length = 0;
    },
  };
};
