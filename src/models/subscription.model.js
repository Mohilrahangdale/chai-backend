import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,//one who is suscribing
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,//one who is being suscribed to
        ref: "User"
    }

},{timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);