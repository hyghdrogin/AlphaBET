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
        location, phone
      } = req.body;
      const user = await models.Users.findOne({ where: { id } });
      await user.update({
        location,
        phone
      });
      await user.save({ fields: ["location", "phone"] });
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
  static async uploadPhoto(req, res) {
    try {
      const { id } = req.person;
      const user = await models.Users.findOne({ where: { id } });
      await user.update({
        photo: req.file.path
      });
      await user.save({ fields: ["photo"] });
      return successResponse(res, 200, "Profile Picture updated Successfully.", user);
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
  static async getProfile(req, res) {
    try {
      const { id } = req.person;
      const user = await models.Users.findOne({ where: { id } });
      return successResponse(res, 200, "Profile Picture updated Successfully.", user);
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
      const user = await models.Users.findOne({ where: { id } });
      user.active = false;
      await user.save();
      const otp = await models.Otps.findOne({ where: { email: user.email } });
      if (otp) {
        await otp.destroy();
      }
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
      const user = await models.Users.findOne({ where: { email } });
      if (user) {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        await models.Otps.create({ email, token: otp });
        const subject = "We are pleased to have you back at AlphaBET";
        const message = `<h1>AlphaBET</h1>
        
        <p>To reactivate user, please confirm your email with this OTP</p>
        <p>${otp}</p>`;
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
      } else {
        return errorResponse(res, 400, "User not found", { user });
      }
      return successResponse(
        res,
        200,
        "Reactivation OTP has been sent to your email Successfully."
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
  static async welcomeBack(req, res) {
    try {
      const { otp } = req.body;
      const otpDey = await models.Otps.findOne({ where: { token: otp } });
      console.log(otpDey.email);
      const user = await models.Users.findOne({ where: { email: otpDey.email } });
      if (user) {
        user.active = true;
        await user.save();
      } else {
        return errorResponse(res, 400, "User not found");
      }
      return successResponse(res, 200, "Profile Picture updated Successfully.", user);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }
}
