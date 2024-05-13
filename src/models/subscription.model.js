import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const subscriberSchema = new Schema(
    {
        id:{


        },
        subscriber:{
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User"
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
    
)

export const Subscription = mongoose.model("Subscription", subscriberSchema)