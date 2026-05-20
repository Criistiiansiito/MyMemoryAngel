process.env.EXPO_PUBLIC_IP = 'http://api.test';
global.__DEV__ = true;
global.IS_REACT_ACT_ENVIRONMENT = true;

const originalConsoleError = console.error;
console.error = (...args) => {
  const [firstArg] = args;
  if (
    typeof firstArg === 'string' &&
    firstArg.includes('react-test-renderer is deprecated')
  ) {
    return;
  }

  originalConsoleError(...args);
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

global.FormData = class FormData {
  constructor() {
    this.fields = [];
  }

  append(key, value) {
    this.fields.push([key, value]);
  }
};
