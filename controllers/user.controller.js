import { body } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js"; 

export const registeruser = asyncHandler(async (req, res) => {

  
  const { fullName, username, email, password } = req.body;

  console.log("email:", email);

  res.status(200).json({
    message: "Register user route working",
    data: { fullName, username, email },
  });
});


      // get user deatails from frontend done 
      // validation - not empty done 
      // check if user allready exists using email done 
      // check for images and avatar 
      // upload them on cloudinary 
      //crate user object 
      // remove password and refresh to frontend 
     //check for user creation