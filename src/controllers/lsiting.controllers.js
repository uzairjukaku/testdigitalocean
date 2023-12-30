import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/coundinary.js";

const getAllListing = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: "all lsiting",
  });
});
const getListingById = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: "listing by id" + req.params.id,
  });
});
const createListing = asyncHandler(async (req, res) => {
  const { building, prefrence, area, city, floor, flat_no, gender, type } =
    req.body;

  if (
    [building, prefrence, area, city, floor, flat_no, gender, type].some(
      (property) => property?.trim() === ""
    )
  ) {
    throw new ApiError(400, "some thing went worng");
  }

  let Images = [];
  Images = req?.files?.images?.map((item) => item.path);

console.log('====================================');
console.log(Images);
console.log('====================================');

  let uplodedImagesPathArray = [];

  if (Images.length > 0) {
    uplodedImagesPathArray = await Promise.all(
      Images.map(async (path) => {
        const uploadedPath = await uploadOnCloudinary(path);
        return uploadedPath.url;
      })
    );
  }

  let documents = [];

  documents = req?.files?.documents?.map((item) => item.path);
  console.log("====================================");
  console.log(uplodedImagesPathArray);
  console.log("====================================");

  const listing = await Listing.create({
    images: uplodedImagesPathArray,
    documents: documents,
    type,
    prefrence,
    building,
    area,
    city,
    floor,
    flat_no,
    gender,
  });

  const createdListing = await Listing.findOne(listing._id);

  if (!createdListing) {
    throw new ApiError(400, "error while creating listing");
  }

  return res.status(201).json(new ApiResponse(201, createdListing));
});
export { getAllListing, getListingById, createListing };
