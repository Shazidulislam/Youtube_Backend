import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middlewares";
import {
  deletedVideo,
  getAllVideo,
  getVideoById,
  publishAVideo,
  updateVideo,
} from "../controllers/video.controller";

const videoRouter = Router();
videoRouter.use(verifyJwt); // // Apply verifyJWT middleware to all routes in this file

videoRouter
  .route("/")
  .get(getAllVideo)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thambuile",
        maxCount: 1,
      },
    ]),
    publishAVideo,
  );

videoRouter
  .route("/:videoId")
  .get(getVideoById)
  .delete(deletedVideo)
  .patch(upload.single("thambuile", updateVideo));

videoRouter.route("/toggle/publish/:videoId");

export default videoRouter;
