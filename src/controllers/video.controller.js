import { Video } from "../models/video.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asynHandler from "../utils/asyncHandeler";

const getAllVideo = asynHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
});


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
  const tumbuilefile = await videoFileLocalPath(thumbuileFileLocalPath);

  console.log(videofile)

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
    duration:videofile?.duration,
    thumbnail: tumbuilefile?.url,
    owner: req?.user?._id,
  });

  return res
    .status(201)
    .json(new ApiError(200, video, "Video uploaded successfully."));
});




const getVideoById = asynHandler(async(req , res)=>{
  
})
