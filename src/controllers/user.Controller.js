import asynHandler from "../utils/asyncHandeler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const genarateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "An unexpected error occurred while generating the access and refresh tokens.",
    );
  }
};

// to do to follow when registerUser
// --> Get user deatils from frontend
//-->Validation -- is any empty data
//-->Check if user allready exists : use email , name

//--> check for file(images , and avatar) is prestent
// --> if have this file upload them to cloudinary
//--> check is successfully upload this file or not in throw multer and cloudinary

// create user object - create entry in DB
// Remove password and refresh token field from response
// check for user creation or not
// if user create successfully then return res

const registerUser = asynHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //   check this user allready register or not
  //   const existendUser = User.findOne({email})
  const existendUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  // if the register is all ready exists throw error
  if (existendUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  console.log(req.files);

  //    check for file(images , and avatar) is  arrive or not

  const avatarLocalFile = req.files?.avatar[0]?.path;
  // const coverImageFile = req.files?.coverImage[0]?.path;

  let coverImageFile;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageFile = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalFile) throw new ApiError(400, "Avatar file  is required");

  //   file upload on Cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalFile);
  const coverImage = await uploadOnCloudinary(coverImageFile);

  if (!avatar) throw new ApiError(400, "Avatar file  is required");

  let user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user?._id).select(
    "-password  -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User create successfully!"));
});

// to do --> follow the for login user
// req body -->data
// username or email
// find a user
// password check
// access and refresh token
// send the token use cookie

const loginUser = asynHandler(async (req, res) => {
  let { username, email, password } = await req.body;

  console.log(email, username, password);

  // if (!username && !email) {
  //   throw new ApiError(400, "Username or email is required");
  // }

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } =
    await genarateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully",
      ),
    );
});

const logoutUser = asynHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asynHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } =
      await genarateAccessTokenAndRefreshToken(decodedToken?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refrehed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});
// day -17
const changeCurrentPassword = asynHandler(async (req, res) => {
  // USE verifyJwt
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(404, "error");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully."));
});

const getCurrentUser = asynHandler(async (req, res) => {
  // USE verifyJwt
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user get successfully"));
});
// update user account details
const accountsDetailsUpdate = asynHandler(async (req, res) => {
  // USE verifyJwt
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email is required!");
  }
  // Duplicate Email Check
  const existingUser = await User.findOne({
    email,
    _id: { $ne: req.user?._id },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true },
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Accounts details  update successfully"));
});

const updateUserAvatar = asynHandler(async (req, res) => {
  // USE verifyJwt
  const avatarLocalFile = req.file?.path;
  if (!avatarLocalFile) {
    throw new ApiError(400, "Avatar file is missing!");
  }

  // TODO delete old image

  const avatar = await uploadOnCloudinary(avatarLocalFile);

  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar update successfully"));
});

const updateUserCoverImage = asynHandler(async (req, res) => {
  //USE verifyJwt
  const coverLocalFile = req.file?.path;

  if (!coverLocalFile) {
    throw new ApiError(400, "Cover local file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverLocalFile);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverimage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Update coverimage successfully"));
});

const nameporeKhujenibo = asynHandler(async (req, res) => {
  // finding total  subscribire

  const { username } = req.user;
  if (!username) {
    throw new ApiError(400, "Username not found");
  }

  const channal = await User.aggregate([
    {
      $match: {
        username: username?.trim(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        chennelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubsCribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        chennelsSubscribedToCount: 1,
        isSubsCribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channal?.length) {
    throw new ApiError("Channal does not exists!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channal[0], "User channal fetched successfully!"),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  accountsDetailsUpdate,
  updateUserAvatar,
  updateUserCoverImage,
};
