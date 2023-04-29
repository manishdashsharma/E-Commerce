import mongoose from "mongoose";
import AuthRoles from "../utils/authRole.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import config from "../config/index.js";
import crypto from "crypto"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: ["true", "Name is required"],
        maxLength: [50, "Name must be less than 50 chars"]
    },
    email: {
        type: String,
        required: ["true", "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "password must be at least 8 chars"],
        select: false
    },
    role: {
        type: String,
        enum: Object.values(AuthRoles),
        default: AuthRoles.USER
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date
}, {timestamps: true})


userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods = {
    comparePassword: async function(enteredPassword){
        return await bcrypt.compare(enteredPassword, this.password)
    },
    getJWTtoken: function(){
        JWT.sign({_id: this._id, role: this.role}, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRY
        })
    },
    
    generateForgotPasswordToken: function (){
        const forgotToken = crypto.randomBytes(20).toString("hex")

        this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(forgotToken)
        .digest("hex")

        this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

        return forgotToken
    }
}


export default mongoose.model("User", userSchema)