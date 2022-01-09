const router = require("express").Router();
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");
const nodemailer = require("nodemailer");
const {
  userregschemavalidation,
  userloginschemavalidation,
  userupdateschemavalidation,
  userotpschemavalidation,
} = require("../validation");
const User = require("../models/User");

const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

// User Login Process Code...
router.post("/login", async (req, res) => {
  const { error } = userloginschemavalidation(req.body);
  if (error)
    return res.status(400).json({
      message: error.details[0].message,
      status: "fail",
    });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({
      message: "Invalid Email or Password!",
      status: "fail",
    });

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    return res.status(400).json({
      message: "User not found!",
      status: "fail",
    });
  } else {
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    res.json({
      data: user,
      token: token,
      status: "success",
      message: "Login Successfull",
    });
  }
  res.end();
});

// Single User Read Operation Code...
router.get("/:id", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({
      data: user,
      status: "success",
      message: "User found successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "User not found!",
      status: "fail",
    });
  } finally {
    res.end();
  }
});

// All User Read Operation Code...
router.get("/", async (req, res) => {
  try {
    const user = await User.find();
    res.json({
      data: user,
      status: "success",
      message: "success",
    });
  } catch (error) {
    return res.status(400).json({
      data: error,
      message: "Something went wrong, please try again later",
      status: "fail",
    });
  }
});

// Delete An User Operation Code...
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.deleteOne({ _id: req.params.id });
    res.json({
      data: user,
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong, please try again later",
      status: "fail",
    });
  } finally {
    res.end();
  }
});

// Update An User Operation Code...
router.patch("/:id", async (req, res) => {
  const { error } = userupdateschemavalidation(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      status: "fail",
    });
  }

  try {
    const salt = await bcrypt.genSaltSync(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          password: hashPassword,
          dob: req.body.dob,
          gender: req.body.gender,
        },
      }
    );

    res.json({
      data: user,
      status: "success",
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong, please try again later",
      status: "fail",
    });
  } finally {
    res.end();
  }
});

//Validate OTP Code..
router.post("/validate-otp", async (req, res) => {
  const { error } = userotpschemavalidation(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      status: "fail",
    });
  }

  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user)
    return res.status(400).json({
      message: "Invalid Email or Password!",
      status: "fail",
    });

  // console.log("CHECK OTP: ", req.body.otp, user.otp);

  if (req.body.otp != user.otp) {
    return res.status(400).json({
      message: "OTP does not matched!",
      status: "fail",
    });
  }
  try {
    const user = await User.updateOne(
      { email: req.body.email },
      {
        $set: {
          status: "ACTIVE",
        },
      }
    );
    res.json({
      data: user,
      status: "success",
      message: "Email validated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong, please try again later",
      status: "fail",
    });
  } finally {
    res.end();
  }
});

// User Registration Process Code...
router.post("/register", async (req, res) => {
  const { error } = userregschemavalidation(req.body);

  if (error) {
    return res.status(400).json({
      data: null,
      message: error.details[0].message,
      status: "fail",
    });
  }

  try {
    const isEmailExist = await User.findOne({ email: req.body.email });

    if (isEmailExist) {
      return res.status(400).json({
        data: null,
        message: "This email is already in use",
        status: "fail",
      });
    }
  } catch (error) {
    return res.status(400).json({
      data: null,
      message: "Something went wrong, please try again later",
      status: "fail",
    });
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  if (!req.files) {
    return res.status(400).json({
      data: null,
      message: "You must select a image to upload",
      status: "fail",
    });
  }

  const userImage = req.files?.userImage || null;
  const fileSize = userImage?.size / 1000;

  if (fileSize > 1024) {
    return res.status(400).json({
      data: null,
      message: "Image size must be less than 1 MB",
      status: "fail",
    });
  }

  if (!allowedMimes.includes(userImage?.mimetype)) {
    return res.status(400).json({
      data: null,
      message: "Image extension must be jpg or png",
      status: "fail",
    });
  }

  try {
    cloudinary.uploader.upload(
      userImage?.tempFilePath,
      {
        folder: "users",
        public_id: `${
          userImage?.name.split(".")?.[0] || "userImage"
        }_${Date.now()}`,
      },
      async (error, image) => {
        if (error) {
          return res.status(400).json({
            data: error.name,
            message: error.message,
            status: "fail",
          });
        } else {
          // console.log("File uploaded: ", image);
          // Successfullimage upload done, now insert data to MongoDB
          // Remove the file from local folder

          fs.unlink(userImage?.tempFilePath, (err) => {
            // console.log("err", err);
          });

          const OTP =
            Math.floor(1000 + Math.random() * 9000) ||
            Math.floor(1000 + Math.random() * 8000);

          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword,
            dob: req.body.dob,
            gender: req.body.gender,
            userImage: image?.url,
            otp: OTP.toString(),
            status: "INACTIVE",
          });

          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
              },
            });

            const mailOptions = {
              from: process.env.EMAIL_ID,
              to: req.body.email,
              subject: "Nodex OTP Confirmation",
              text: `Hi Nodex User,\n\nYour OTP is: ${OTP}\n\nPlease verify your OTP to Login now.`,
            };

            await transporter.verify();

            const result = await user.save();

            res.json({
              data: result,
              status: "success",
              message: "User added successfully",
            });

            transporter.sendMail(mailOptions, (err, response) => {
              // if (err) {
              //   console.log("Error: " + err);
              // } else {
              //   console.log("OTP Send Successfull", response);
              // }
            });
          } catch (error) {
            // return res.status(400).json({
            //   data: error,
            //   message: "Error in sending Email OTP",
            //   status: "fail",
            // });
            // console.log("Error in sending Email OTP: " + error);
          }
        }
      }
    );
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      data: null,
      message: error,
      status: "fail",
    });
  }
});

module.exports = router;
