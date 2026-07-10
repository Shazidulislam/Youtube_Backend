import asynHandler from "../utils/asyncHandeler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
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
  const existendUser = User.findOne({
    $or: [{ username }, { email }],
  });
  // if the register is all ready exists throw error
  if (existendUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //    check for file(images , and avatar) is  arrive or not

  let avatarLocalFile = req.files?.avatar[0]?.path;
  let coverImageFile = req.files?.coverImage[0]?.path;

  if (!avatarLocalFile) throw new ApiError(400, "Avatar file  is required");

  //   file upload on Cloudinary

  let avatar = await uploadOnCloudinary(avatarLocalFile);
  let coverImage = await uploadOnCloudinary(coverImageFile);

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

export default registerUser;
