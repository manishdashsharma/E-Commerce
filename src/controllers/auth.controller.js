import User from '../models/user.schema.js'
import asyncHandler from '../services/asyncHandler.js'
import CustomError from '../services/CustomError.js'
import mailHelper from '../utils/mailHelper.js'
import crypto from "crypto"
import AuthRoles from "../utils/authRole.js";
import twilioSMS from '../utils/sendSMS.twilio.js'
import generateOTP from '../utils/generateOTP.js';
import formidable from 'formidable';
import cloudinary from "../config/cloudinary.config.js";
import config from './../config/index.js';


export const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true
}

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password, role, phoneNumber, address } = req.body;

  if (!name || !email || !password || !phoneNumber) {
      throw new CustomError("Please add all fields", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
      throw new CustomError("User already exists", 400);
  }

  const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      address
  });

  const token = user.getJWTtoken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
      success: true,
      token,
      user,
  });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError("Please provide email or password");
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new CustomError("Invalid user", 400);
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (isPasswordMatched) {
        const token = await user.getJWTtoken();
        user.password = undefined;
        res.cookie("token", token, cookieOptions);
        res.status(200).json({
            success: true,
            token,
            user
        });
    } else {
        throw new CustomError("Password does not match!", 400);
    }
});

export const logout = asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})

export const getProfile = asyncHandler( async(req, res) => {
    const {user} = req

    if(!user){
        throw new CustomError("User not found",401)
    }

    res.status(200).json({
        success: true,
        user
    })

})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email , frontend_url } = req.body;
  
  if (!email) {
    throw new CustomError("Provide email id please", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const resetToken = user.generateForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/password/reset/${resetToken}`;

  const forgot_password_url = `${frontend_url}/${resetToken}`;

  const message = `Your password reset token is as follows:\n\n${resetUrl}\n\n${forgot_password_url}\n\nIf this request was not made by you, please ignore this email.`;
  
  
  try {
    const option = {
      email: user.email,
      subject: "Password reset mail",
      message,
    };
    await mailHelper(option);

    res.status(200).json({
      success: true,
      message: "Check your mail to your email address.",
      resetUrl,
      resetToken, 
      forgot_password_url
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new CustomError(error.message || "Email could not be sent", 500);
  }
});
  
export const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: resetPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new CustomError("Password reset token is invalid or expired", 400);
  }

  if (password !== confirmPassword) {
    throw new CustomError("Passwords do not match", 400);
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();
  user.password = undefined;
  const token = user.getJWTtoken();
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    user
  });
});

export const updateUserRole = asyncHandler( async (req,res)=> {
    const { email } = req.body

    if (!email) {
        throw new CustomError("Please enter email address",404)
    }

    const user = await User.findOneAndUpdate(
        { email }, 
        { role: AuthRoles.ADMIN },
        {
            new: true,
            runValidators: true,
        }
    )
    
    if (!user) {
        throw new CustomError("Email not found",404)
    }

    res.status(200).json({
        success: true,
        message: "User role has been updated",
        user
      });
})

export const updateUserAddress = asyncHandler( async (req, res) => {
  const { user : userinfo } = req
  const { address } = req.body

  if(!userinfo) {
    new CustomError("User not found",404)
  }

  const user = await User.findByIdAndUpdate(
    userinfo._id, { address } ,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!user) {
    new CustomError("User info could not update",400)
  }

  res.status(200).json({
    success: true,
    message: "User info updated successfully",
    user
  })
})

export const sendOTP = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  const generatedOTP = await generateOTP(8);
  const option = {
    to: phoneNumber,
    body: `Here is your OTP: ${generatedOTP}`,
  };

  await twilioSMS(option);
  
  const user = await User.findOneAndUpdate(
    { phoneNumber }, 
    { mobileOtp: generatedOTP },
    {
      new: true,
      runValidators: true,
    }
  );
  console.log(user);
  res.status(200).json({
    success: true,
    message: 'OTP was sent successfully'
  });
});

export const loginWithPhoneNumber = asyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    throw new CustomError("Provided phone number and OTP are required", 400);
  }

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    new CustomError("No user found", 400);
  }

  if( user.length > 1){
    new CustomError("Multiple users found with the same phone number , please use email login", 400);
  }
  
  if (user.mobileOtp === otp) {
    user.mobileOtp = undefined;
    const token = await user.getJWTtoken();
    res.cookie("token", token, cookieOptions);
    await user.save();
    res.status(200).json({
      success: true,
      message: 'OTP was verified successfully',
      token,
      user,
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    });
  }
});

export const updateProfileImage = asyncHandler(async (req, res) => {
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async function (error, fields, files) {
    if (error) {
      throw new CustomError(error.message || 'Something went wrong', 500);
    }

    const { user } = req;

      const upload = await cloudinary.v2.uploader.upload(files.profileImage.filepath, {
        folder: config.profileImageFolder
      });

      user.profileImage = upload.secure_url ;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile image updated successfully",
        user
      })
  })
})
