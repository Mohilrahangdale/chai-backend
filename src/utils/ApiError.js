class ApiError extends Error{
    //constructor(){}
    constructor(
        statusCode,
        message="Something went wrong",
        error = [],
        statck = ""

    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        //niche nhi bhi samja to jane do as it likh dena
        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}