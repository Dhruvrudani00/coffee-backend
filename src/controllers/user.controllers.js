import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // user register details

  // get user details from frontend
  const { Fullname, Email, Username, password } = req.body;
  console.log("Email:", Email);

  // validation - no empty fields
  if (
    [Fullname, Email, Username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists username/email
  const existedUser = await User.findOne({
    $or: [{ Username }, { Email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists.");
  }

  // check for images and avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary especially avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // create user object and create entry in Database
  const user = await User.create({
    Fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    Email,
    password,
    Username: Username.toLowerCase(),
  });

  // remove password and refreshtoken field
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
