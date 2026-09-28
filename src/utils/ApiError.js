class ApiError extends Error{
    //constructor(){}
    constructor(
        statusCode,
        message="Something went wrong",
        error = [],
        stack = ""

    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.error = error

        //niche nhi bhi samja to jane do as it likh dena
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}