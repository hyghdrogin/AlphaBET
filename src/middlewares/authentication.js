import jwt from "jsonwebtoken";
import { errorResponse } from "../utilities/responses";
import models from "../models";
import config from "../config";

/**
 * @class Authentication
 * @description authenticate token and roles
 * @exports Authentication
 */
export default class Authentication {
  static async verifyToken(req, res, next) {
    try {
      if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2) {
          const scheme = parts[0];
          const credentials = parts[1];
          if (/^Bearer$/i.test(scheme)) {
            const token = credentials;
            const decoded = await jwt.verify(token, config.JWT_KEY);

            const user = await models.Users.findOne({ where: { id: decoded.id } });
            if (!user) return errorResponse(res, 404, "User account not found");
            req.person = user;
            return next();
          }
        } else {
          return errorResponse(res, 401, "Invalid authorization format");
        }
      } else {
        return errorResponse(res, 401, "Authorization not found");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async verifyAdmin(req, res, next) {
    try {
      const { _id } = req.person;
      const admin = await models.User.findOne({ _id, role: "admin" });
      if (!admin) return errorResponse(res, 401, "Unauthorized access.");
      return next();
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}
