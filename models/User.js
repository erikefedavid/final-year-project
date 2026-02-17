import mongoose from "mongoose"

const userSchema = new mongoose.Schema (
    {
        name : {
            type: String,
            required : [true, "Name is required"],
            trim : true
        },

        email: {
            type : String,
            unique : true,
            required : [true, 'email is required'],
            lowercase : true,
            trim : true,
        },

        password : {
            type : String,
            required : [true, "password is required"],
            minlength : [6, "password must be at least 6 characters"]
        },
    },
        {
            timestamps: true,
        }  
)

export default mongoose.models.user || mongoose.model("user", userSchema)