const asyncHandler = (requestHandeler) => {
    (req,res,next) =>{
        Promise.resolve(requestHandeler(req,res,next)).catch((err) => next(err))
    }
}


export {asyncHandler}

//const asyncHandler = () = {}
//const asyncHandler = (func) => () => {}//isko eise samjjo  const asyncHandler = (func) => {() => {}}
//const asyncHandler = () => async() => {}


    //try catch format me 
// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
        
//     }
// }     