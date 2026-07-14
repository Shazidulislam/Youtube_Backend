import asynHandler from "../utils/asyncHandeler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

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

  if(!(username || email)){
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

export { registerUser, loginUser, logoutUser };
