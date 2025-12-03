import { MongoClient } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const options = {
    appName: "devrel.vercel.integration",
    maxIdleTimeMS: 5000
};

let mongoclient = null;

export function getMongoClient() {
    if (!mongoclient) {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not set");
        }
        mongoclient = new MongoClient(process.env.MONGODB_URI, options);
        // Attach the client to ensure proper cleanup on function suspension
        attachDatabasePool(mongoclient);
    }
    return mongoclient;
}

// Export a default getter for backwards compatibility
export default { 
    db: () => getMongoClient().db() 
}; 