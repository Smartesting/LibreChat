const { SystemRoles } = require('librechat-data-provider');
const { getOngoingTrainings } = require('~/models/Training');

async function checkTrainingAccess(req, res, next) {
  const { role, _id, email } = req.user;

  try {
    if ([SystemRoles.ADMIN, SystemRoles.ORGADMIN].includes(role)) {
      return next();
    }

    if ([SystemRoles.TRAINER, SystemRoles.TRAINEE].includes(role)) {
      const ongoingTrainings = await getOngoingTrainings();

      if (!ongoingTrainings || ongoingTrainings.length === 0) {
        return res.status(403).json({ message: 'no_ongoing_training' });
      }

      const hasAccess = ongoingTrainings.some((training) => {
        if (role === SystemRoles.TRAINER) {
          return training.trainers?.some((trainerId) => trainerId.equals(_id));
        }

        if (role === SystemRoles.TRAINEE) {
          return training.trainees?.some((trainee) => trainee.username === email);
        }

        return false;
      });

      if (!hasAccess) {
        return res.status(403).json({ message: 'no_ongoing_training' });
      }
      return next();
    }

    return next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
}

module.exports = checkTrainingAccess;
