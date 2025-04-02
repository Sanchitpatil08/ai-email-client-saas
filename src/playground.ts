import { db } from "./server/db";

await db.user.create({
    data: {
        emailAddress:"test@gmail.com",
        firstname:"elliot",
        lastName:"chong",
    }
})

console.log("Done!!")