import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResonse.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if(!userId?.trim()) {
        throw new ApiError(400, "User is missing")
    }

    const video = await Video.aggregate([
        {
            $match : {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            $match : {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner : {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: { 
                [sortBy]: sortType == "asc" || 1 
            }
        },
        {
            $match: { 
                isPublished: true 
            }
        },
        {
            $project: {
                userName: 1,
                fullname: 1,
                avatar: 1,
            },             
        }
    ])

    //     // console.log(userId)
    //     const pipeline = [];
    //     if (query) {
    //       pipeline.push({
    //         $match: {
    //           title: {
    //             $regex: query,
    //             $options: "i",
    //           },
    //         },
    //       });
    //     }
      
    //     if (userId) {
    //       pipeline.push({
    //         $match: {
    //           owner: new mongoose.Types.ObjectId(req.user._id),
    //         },
    //       });
    //     }
      
    //     pipeline.push(
    //       {
    //         $addFields: {
    //           createdAt: {
    //             $dateToParts: { date: "$createdAt" },
    //           },
    //         },
    //       },
      
    //       {
    //         $lookup: {
    //           from: "users",
    //           localField: "owner",
    //           foreignField: "_id",
    //           as: "owner",
    //           pipeline: [
    //             {
    //               $project: {
    //                 userName: 1,
    //                 fullname: 1,
    //                 avatar: 1,
    //               },
    //             },
    //           ],
    //         },
    //       },
      
    //       {
    //         $addFields: {
    //           owner: {
    //             $first: "$owner",
    //           },
    //         },
    //       }
    //     );
      
    //     pipeline.push({
    //       $match: { isPublished: true },
    //     });
      
    //     if (sortBy) {
    //       pipeline.push({
    //         $sort: { [sortBy]: sortType == "asc" || 1 },
    //       });
    //     }
      
    //     const aggregate = Video.aggregate(pipeline);
    //     // console.log(aggregate)
      
    //     const video = await Video.aggregatePaginate(aggregate, {
    //       page,
    //       limit,
    //     });
      
    //     res
    //       .status(200)
    //       .json(new ApiResponse(200, video, "video feached successfully"));
    //   });
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const user = req.user;

    const videoLocalPath = req.files?.videoFile[0].path
    if(!videoLocalPath) {
        throw new ApiError("Video File is required")
    }

    const thumbnailLocalPath = req.files?.videoFile[0].path
    if(!thumbnailLocalPath) {
        throw new ApiError("Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!(videoFile || thumbnail)) {
        throw new ApiError("Video file and Thumbnail is required")
    }

    const video = await Video.create({
        title,
        description,
        user,
        thumbnail: thumbnail.url,
        videoFile: videoFile.url,
        duration: videoFile.duration
    })

    if(!video) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res.status(201).json(
        new ApiResponse(200, video, "Video Uploaded Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById(videoId).populate('owner')
;
    if(!videoId) {
        throw new ApiError(401, "video doesn't exist")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Fetched video Succesfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    
    // if(!videoId) {
    //     throw new ApiError(400, "File doesn't exist")
    // }

    const videoLocalPath = req.file?.videoFile[0].path
    const thumbnailLocalPath = req.file?.thumbnail[0].path

    // TODO: delete old image - assignment

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!(video.url || thumbnail.url)) {
        throw new ApiError(400, "Error while uploading on video or thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                videoFile: videoFile.url,
                thumbnail: thumbnail.url
            }
        },
        {new: true}
    )

    return res.status(200)
    .json(
        new ApiResponse(200, video, "Video updated succesfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId.url) {
        throw new ApiError(400, "Video doesn't exist")
    }
    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted succesfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}