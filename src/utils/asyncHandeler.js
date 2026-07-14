
// this a Higher-Order-Function(HOF)
const asynHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};



export default asynHandler;

// const asyncHandler =()=>{}
//   const asyncHandler =(func)=>()=>{} Higher order function
// const asyncHandler = (func)=>{async()=>{}} its also higher order function

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req , res , next);
//   }
//   catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };
