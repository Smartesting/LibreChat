const cron = require('node-cron');
const {
  runRemoveExpiredTraineeAccountsJob,
} = require('~/server/utils/tasks/removeExpiredTraineeAccounts');

const startCrons = () => {
  console.log('Starting crons...');
  cron.schedule('*/1 * * * *', runRemoveExpiredTraineeAccountsJob); // toutes les minutes
  // cron.schedule('0 0 * * *', runRemoveExpiredTraineeAccountsJob); //minuit
};

module.exports = { startCrons };
