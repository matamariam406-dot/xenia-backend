let history: any[] = [];

export const addMessage = (role: string, content: string) => {
  history.push({ role, content });
};

export const getHistory = () => history;

export const clearHistory = () => {
  history = [];
};
