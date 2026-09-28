import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {//yha file bhi upload ho rhi hai aur req bhi pass ho rha hai
    cb(null, "./public/temp"); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname); // Generate a unique filename
  }
});

const upload = multer({ storage: storage });

export { upload };