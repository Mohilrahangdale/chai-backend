import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null;
            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type: 'auto'//ye detect kar lega ki file image hai ya video ya fir koi aur
            })
            //file has been uploaded successfully
            console.log("file uploaded on cloudinary", response.url);
            return response;
            
        } catch (error) {
            fs.unlinkSync(localFilePath) //delete the file from local storage if it fails to upload on cloudinary
            return null;
            
        }
    }

    export {uploadOnCloudinary}


//isko hmne uper vale se replace kiya
    // cloudinary.v2.uploader.upload("http://res.cloudinary.com/demo/image/upload/w_100,h_150,c_fill,g_face,r_max/w_80/lady.jpg",
    // { public_id: "lady" }, 
    // function(error, result) {console.log(result, error); });