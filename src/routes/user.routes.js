import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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

userRouter.route("/login").post(loginUser)

// secured routes
userRouter.route("/logout").post(verifyJwt , logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)

export default userRouter;
