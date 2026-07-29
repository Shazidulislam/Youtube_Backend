import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asynHandler from "../utils/asyncHandeler.js";

const createPlayList = asynHandler(async (req, res) => {
  const { name, description } = req.body;

  //  TODO: create playlist
  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }

  if (!description?.trim()) {
    throw new ApiError(400, "Playlist description is required.");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorize reques");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req?.user._id,
  });

  if (!playlist) {
    throw new ApiError(
      500,
      "Something went wrong while creating the playlist.",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist create successfully."));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "User not found , give a valied user id");
  }

  // play list not should be privite
  // if (userId?.toString() !== req?.user?._id.toString()) {
  //   throw new ApiError(403, "You are not authorize to found this aplylist");
  // }

  // const playlist = await Playlist.find({
  //   owner: userId,
  // });

  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "userPlaylist",
        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: "$userPlaylist",
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist found successufully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Playlist id is required.");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos", "videoFile thumbnail title duration views")
    .populate("owner", "username fullName avatar");

  if (!playlist) {
    throw new ApiError(404, "Playlist does  not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});
