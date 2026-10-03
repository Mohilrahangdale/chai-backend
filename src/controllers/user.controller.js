import { asyncHandler } from '../utils/asyncHandler.js';

import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh tokens")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //username or email
    //find user
    //password check
    //access token and refresh token generate
    //send cookies

    const { email, username, password } = req.body;
    if(!email && !username){
        throw new ApiError(400, "username or email is required")

    }

    const user = await User.findOne(
        { $or: [{ email }, { username }] }
    )

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    //kahi baar kafenge ye kaamm hm
    const { accessToken, refreshToken } = await 
    generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("acessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,{
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully")
    ) 

})


const logoutUser = asyncHandler(async (req, res) => {
    //middleware ki baat aayyengi hmm khud ka ek middleware banaenge jo ki user ko authenticate karega

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.
    status(200).
    clearCookie("accessToken", options).
    clearCookie("refreshToken", options).
    json(
        new ApiResponse(200, {}, "User logged out successfully")
    )


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefrreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefrreshToken){
        throw new ApiError(401, "Refresh token is required")
    }
    const decodedToken = jwt.verify(incomingRefrreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user ){
        throw new ApiError(401, "Invalid refresh token")
    }

    if(incomingRefrreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token mismatch")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(200, { accessToken, refreshToken : newRefreshToken }, "Access token refreshed successfully")
    )
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Current password is incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { user: req.user }, "Current user retrieved successfully")
    )
})
    
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            fullName,
            email
        }
    }, { new: true }).select("-password")

    return res.status(200).json(
        new ApiResponse(200, { user }, "Account details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true }).select("-password")

    return res.status(200).json(
        new ApiResponse(200, { user }, "Avatar updated successfully")
    )
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password")

    return res.status(200).json(
        new ApiResponse(200, { user }, "Cover image updated successfully")
    )
})



export { registerUser,
    loginUser, logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};
