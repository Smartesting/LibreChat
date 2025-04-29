const checkAdmin = require('./checkAdmin');
const checkOrgAccess = require('./checkOrgAccess');
const { checkAccess, generateCheckAccess } = require('./generateCheckAccess');

module.exports = {
  checkAdmin,
  checkOrgAccess,
  checkAccess,
  generateCheckAccess,
};
