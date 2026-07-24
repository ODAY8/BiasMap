const jwt = require('jsonwebtoken');
const { jwt: jwtCfg } = require('../config/env');

const signAccess = (payload) => jwt.sign(payload, jwtCfg.secret, { expiresIn: jwtCfg.expiresIn });
const signRefresh = (payload) => jwt.sign(payload, jwtCfg.refreshSecret, { expiresIn: jwtCfg.refreshExpiresIn });
const verifyAccess = (token) => jwt.verify(token, jwtCfg.secret);
const verifyRefresh = (token) => jwt.verify(token, jwtCfg.refreshSecret);

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
