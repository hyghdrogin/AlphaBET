import { DateTime } from "luxon";

const reqLogger = async (req, res, next) => {
  console.info(`request (${DateTime.now().toISO()}): ${req.protocol}://${req.hostname}${req.originalUrl} (${req.method})`);
  return next();
};

export default reqLogger;
