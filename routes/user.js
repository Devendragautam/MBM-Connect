import express from "express";
import { registeruser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = express.Router();

router.route("/register").post(
       upload.fields([
       { name: "avatar", 
        maxCount: 1 },
       { name: "coverImage",
         maxCount: 1 },
       ]),
       registeruser
)

export default router;
