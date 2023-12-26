import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { uploadOnCloudinary } from "../utils/coundinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullName, password } = req.body;

  console.log(email, username, fullName, password);

  if (
    [email, username, fullName, password].some(
      (property) => property?.trim() === ""
    )
  ) {
    throw new ApiError(400, "some thing went worng");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    email,
    fullName,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  console.log(createdUser);

  if (!createdUser) {
    throw new ApiError(400, "error while registring user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser));
});

export { registerUser };
