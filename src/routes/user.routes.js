import { Router } from 'express';
import { registerUser,refreshAccessToken} from '../controllers/user.controller.js';
import {User} from '../models/user.model.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { loginUser, logoutUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';



const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
//router.route("/login").post(loginUser);

router.route("/login").post(loginUser);
//secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);



export default router;