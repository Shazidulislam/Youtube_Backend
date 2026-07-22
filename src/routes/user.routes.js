import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  accountsDetailsUpdate,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

userRouter.route("/login").post(loginUser);

// secured routes
userRouter.route("/logout").post(verifyJwt, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/change-Password").post(verifyJwt, changeCurrentPassword);
userRouter.route("/current-user").get(verifyJwt, getCurrentUser);
userRouter.route("/update-account").patch(verifyJwt, accountsDetailsUpdate);
userRouter
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

userRouter.route("/channel/:username").get(verifyJwt, getUserChannelProfile);
userRouter.route("/user-history").get(verifyJwt, getWatchHistory);

export default userRouter;
