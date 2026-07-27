import { Video } from "../models/video.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asynHandler from "../utils/asyncHandeler";
import uploadOnCloudinary from "../utils/Cloudinary";

const getAllVideo = asynHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
});

// upload a video
const publishAVideo = asynHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // work flow
  //at frist  title , description take from body
  if (!title || !description) {
    throw new ApiError(400, "video title and description is required");
  }
  //take video  and thambuile file from req.files
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbuileFileLocalPath = req.files?.thambuile?.[0]?.path;

  if (!videoFileLocalPath || !thumbuileFileLocalPath) {
    throw new ApiError(400, "Video and thumbile file are required.");
  }

  //  now video and thumbuile file uploadOnCloudinary and take url
  //and upload on uploadOnCloudinary

  const videofile = await uploadOnCloudinary(videoFileLocalPath);
  const tumbuilefile = await uploadOnCloudinary(thumbuileFileLocalPath);

  console.log(videofile);

  // if file not found the give error
  if (!videofile?.url) {
    throw new ApiError(
      500,
      "Encountered an error while uploading the video file to Cloudinary.",
    );
  }

  if (!tumbuilefile?.url) {
    throw new ApiError(
      500,
      "Encountered an error while uploading the thumbuile file to Cloudinary.",
    );
  }

  // create entry on Mongodb

  // reamber  on route use veryfyJwt for found owner
  const video = await Video.create({
    title,
    description,
    videoFile: videofile?.url,
    duration: videofile?.duration,
    thumbnail: tumbuilefile?.url,
    owner: req?.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully."));
});

// get video by id
const getVideoById = asynHandler(async (req, res) => {
  // take videoId
  const { videoId } = req.params;

  // if video id is not exists then give error
  if (!videoId) {
    throw new ApiError(400, "Video id is not exists.");
  }

  //get video from database
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

// updated a video  //ok
const updateVideo = asynHandler(async (req, res) => {
  // TODO UPDATE VIDEO DEATILS like , title , description , thumbuile
  // take like , title , description for req.body
  // take thumbuile for req.file?.path   and use upload.single in routes
  // and check the owner
  const { videoId } = req.params;

  const { title, description } = req.body;
  const thumbnailLocalFile = req?.file?.path;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!title) {
    throw new ApiError(400, "Title is required.");
  }

  if (!description) {
    throw new ApiError(400, "Description is required.");
  }

  if (!thumbnailLocalFile) {
    throw new ApiError(403, "Thumbnail file is required");
  }

  const existstenceVideo = await Video.findById(videoId);

  if (!existstenceVideo) {
    throw new ApiError(404, "Video not found.");
  }

  if (existstenceVideo?.owner?.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorize to update this video.");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalFile);

  if (!thumbnail?.url) {
    throw new ApiError(400, "Thumbnail is required.");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully."));
});

// delete a video
const deletedVideo = asynHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  // at fris check the id is found or not
  // then check the video use id
  // now check the owner of video, beacuse only owner can delete the video
  // then delete the video
  // and send a valied response

  if (!videoId) {
    throw new ApiError(400, "Video id is required.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  // only owner can delete his on video
  if (video.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // delete the video
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully."));
});
