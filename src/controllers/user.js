import bcrypt from "bcrypt";
import sgMail from "@sendgrid/mail";
import { Op } from "sequelize";
import config from "../config";
import models from "../models";
import { successResponse, errorResponse, handleError } from "../utilities/responses";
import sendEmail from "../utilities/email";
import jwtHelper from "../utilities/jsonwebtoken";

const { generateToken } = jwtHelper;
/**
 * @class UserController
 * @description create, log in user
 * @exports UserController
 */
export default class UserController {
  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async createUser(req, res) {
    try {
      let {
        firstName, lastName, username, email, dob, password, photo
      } = req.body;
      if (!username) {
        username = email.substring(0, email.lastIndexOf("@"));
      }
      if (req.file) {
        console.log("Uploading Profile Picture");
        photo = req.file.filename;
      } else {
        console.log("No file uploaded");
      }
      const emailExist = await models.Users.findOne({ where: { email } });
      if (emailExist) {
        return errorResponse(res, 409, "Email already registered by another user.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const details = await models.Users.create({
        firstName, lastName, email, username, dob, password: hashedPassword, photo
      });
      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
      await models.Otps.create({
        email, token: otp, expired: false
      });
      const subject = "Please confirm your e-mail for AlphaBET";
      const message = `<h1>AlphaBET</h1>
      
      <p>To use the service, please confirm your email with the OTP</p>
      <h3><p>${otp}</p></h3>`;
      // await sendEmail(email, subject, message);
      sgMail.setApiKey(config.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: `AlphaBET <${config.SENDGRID_EMAIL}>`,
        subject,
        html: message,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        });
      return successResponse(res, 201, "Account created successfully, kindly verify your email and login.", details);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async verifyAccount(req, res) {
    try {
      const { otp, email } = req.body;
      const user = await models.Users.findOne({ where: { email }, attributes: { exclude: ["password"] } });
      const otpDey = await models.Otps.findOne({ where: { token: otp } });
      if (!otpDey) {
        return errorResponse(res, 404, "Otp not found.");
      }
      if (otpDey.expired) {
        return errorResponse(res, 409, "Otp expired.");
      }

      await user.update({ verified: true });
      await otpDey.update({ expired: true });
      return successResponse(
        res,
        200,
        "User Account Verified Successfully.",
        user
      );
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async loginUser(req, res) {
    try {
      const { username, password } = req.body;

      const user = await models.Users.findOne({
        where: {
          [Op.or]: [{ email: username }, { username }]
        }
      });
      if (!user) return errorResponse(res, 404, "Email or Username number not found");
      if (!user.verified) {
        return errorResponse(res, 409, "Kindly verify your account before logging in.");
      }
      if (!user.active) {
        return errorResponse(res, 403, "User account Deactivated, Kindly Reactivate account");
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return errorResponse(res, 404, "Password is not correct!.");
      }
      const { id, email } = user;
      const token = await generateToken({ id, email });
      const userDetails = {
        id, email, username, firstname: user.firstName, lastName: user.lastName, dob: user.dob, phone: user.phone, location: user.location, role: user.role, photo: user.photo, balance: user.balance, active: user.active, verified: user.verified
      };
      return successResponse(
        res,
        200,
        "User Logged in Successfully.",
        { token, userDetails }
      );
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async updateProfile(req, res) {
    try {
      const { id } = req.person;
      const {
        username, dob, location, phone
      } = req.body;
      const user = await models.User.findOne({ id });
      await user.update({
        username, dob, phone, location
      });
      await user.save();
      return successResponse(res, 200, "Profile updated Successfully.", user);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async deactivateUser(req, res) {
    try {
      const { id } = req.person;
      const user = await models.User.findOrCreate({
        id,
        default: {
          verified: false, active: false
        }
      });
      const otp = await models.Otp.findOne({ where: { email: user.email } });
      console.log(otp.token);
      await otp.destroy();
      return successResponse(
        res,
        200,
        "User Deactivated Successfully.",
        { user }
      );
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async reactivateUser(req, res) {
    try {
      const { email } = req.body;
      const user = await models.User.findOne({
        email,
        default: {
          verified: true, active: true
        }
      });
      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
      await models.Otp.create({ email, token: otp });
      const subject = "We are pleased to have you back at AlphaBET";
      const message = `<h1>AlphaBET</h1>
      
      <p>To reactivate user, please confirm your email</p>
      <p><a href="${url}/api/users/verify/${otp}"><button type="button">Confirm my e-mail</button></a></p>`;
      await sendEmail(email, subject, message);
      return successResponse(
        res,
        200,
        "User Reactivated Successfully.",
        { user }
      );
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }
}
