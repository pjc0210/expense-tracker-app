import express from "express";
import dotenv from "dotenv";
import {sql} from "./config/db.js";
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

async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;

        console.log("Database initialized successfully")
    } catch (error) {
        console.log("Error initializing DB", error);
        process.exit(1); // status code 1 means failure, 0 means success
    }
}

app.get("/health", (req, res) => {
    res.send("Server is working!");
})

app.use("/api/transactions", transactionsRoute);


initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is up and running on PORT:", PORT)
    });
});

