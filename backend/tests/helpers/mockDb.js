const query = jest.fn();
const getConnection = jest.fn();

const resetDbMocks = () => {
  query.mockReset();
  getConnection.mockReset();
};

module.exports = {
  query,
  getConnection,
  resetDbMocks,
};
