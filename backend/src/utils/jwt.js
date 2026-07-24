// Auth is disabled — JWT functions are stubs.
// Nothing in the active codebase calls these, but the file must not crash on require.
const notEnabled = () => { throw new Error('JWT auth is not enabled'); };

module.exports = {
  signAccess: notEnabled,
  signRefresh: notEnabled,
  verifyAccess: notEnabled,
  verifyRefresh: notEnabled,
};
