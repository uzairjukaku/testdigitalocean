import { Router } from "express";
import { createListing, getAllListing, getListingById } from "../controllers/lsiting.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/").get(getAllListing);
router.route("/:id").get(getListingById);
router.route("/add").post(verifyJWT,  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "documents",
      maxCount: 10,
    },
  ]), createListing);



export default router;