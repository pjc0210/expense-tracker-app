import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
// import { expressjwt } from "express-jwt";

dotenv.config();

const app = express();

// middleware
// TODO: when login is implemented, use expressjwt to create a token on login + use to authMiddleware
// app.use(authMiddleware); //populates req.user for the rateLimiter to use
app.use(rateLimiter); // applies rateLimiter to middleware
app.use(express.json());

const PORT = process.env.PORT;



app.get("/health", (req, res) => {
    res.send("Server is working!");
})

app.use("/api/transactions", transactionsRoute);


initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is up and running on PORT:", PORT)
    });
});

