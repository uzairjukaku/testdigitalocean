import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { uploadOnCloudinary } from "../utils/coundinary.js";

const generateAccessAndRefreshTOken = async (userId) => {
  const user = await User.findOne(userId);

  const accesstoken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accesstoken, refreshToken };

  try {
  } catch (error) {
    throw new ApiError(
      400,
      "something went worong while generating access and refresh token"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const existedUser = await User.findOne({ email });

  if (!existedUser) {
    throw new ApiError(400, "User not exist.please register");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Worng password");
  }

  const { accesstoken, refreshToken } = await generateAccessAndRefreshTOken(
    user._id
  );

  const loginUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loginUser,
        refreshToken,
        accesstoken,
      },"user login successfully")
    );
});

export { registerUser, loginUser };
