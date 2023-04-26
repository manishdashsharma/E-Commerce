import mongoose from "mongoose";
import app from './src/app.js'
import config from "./src/config/index.js";

( async () => {
    try {
        await mongoose.connect(config.MONGODB_URL)
        console.log("DB connected !")
        
        app.on('error' , (error) => {
            console.log("ERROR: ", error);
            throw error
        })

        const onlistening = () => {
            console.log(`Listening on port ${config.PORT}`);
        }

        app.listen(config.PORT,onlistening)

    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()