import { Video } from "../models/video.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asynHandler from "../utils/asyncHandeler";

const getAllVideo = asynHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asynHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asynHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  //   if id is not exists then give error
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  //   find a video use id
  const video = await Video.findById(videoId);

  //   video not found
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});
