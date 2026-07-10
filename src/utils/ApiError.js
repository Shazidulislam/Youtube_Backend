

class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        success=false,
        errors =[],
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.success = success;
        this.errors = errors;
        this.data = null; 
        this.message = message;

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
// 👉 constructor noise remove করে clean origin দেখায়

// Error.captureStackTrace is used to remove constructor noise from stack trace and provide clean debugging information about the actual error origin. 

// captureStackTrace ei asole error ta koi theke astese oi ta  teack kor ar syntext ta holo this , this.constructor mane je class ta theke error ta asche oi class er constructor ke refer korbe

export default ApiError;