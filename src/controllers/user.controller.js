import { asyncHandler } from '../utils/asyncHandler.js';

import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler( async (req, res) => {
   //get user details from frontend
   //validation of user details - not empty
   //check if user already exists : username or email
   //check for avatar and cover image
   //upload avatar and cover image to cloudinary
   //create user object - create enrty in db 
   //remove password and refresh token feild from response
   //check for user creation 
   // return res

    const { fullName, email,usernamme, password } = req.body
    console.log("email",email);

    if([fullName, email,usernamme, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({$or:[{email},{username}]})

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files &&Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }




    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar are required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Failed to upload avatar on cloudinary")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username : username.tolowerCase(),
        password
    })




    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )



});


export { registerUser };
