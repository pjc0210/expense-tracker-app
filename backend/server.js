import express from "express";
import dotenv from "dotenv";
import {sql} from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { expressjwt } from "express-jwt";

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

app.get("/api/transactions/:userId", async (req, res) => {
    try {
        const {userId} = req.params;
        
        const transactions = await sql`SELECT * FROM transactions
            WHERE user_id = ${userId}
            ORDER BY created_at DESC`;
        
        res.status(200).json(transactions);

    } catch (error) {
        console.log("Error fetching the transaction", error);
        res.status(500).json({message: "Internal server error"});
    }
})

app.post("/api/transactions", async (req, res) => {
    // title, amount, category, user_id
    try {
        const {title, amount, category, user_id} = req.body;

        if (!title || !amount || !category || user_id === undefined) {
            return res.status(400).useChunkedEncodingByDefault({ message: "All fields are required"});
        }

        const transaction = await sql`INSERT INTO transactions(user_id, title, amount, category)
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *`;
        console.log(transaction);
        res.status(201).json(transaction[0]);

    } catch (error) {
        console.log("Error creating the transaction", error);
        res.status(500).json({message: "Internal server error"});
    }
});

app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const {id} = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({message: "Invalid transaction ID"});
        }

        const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;

        if (result.length === 0){
            return res.status(404).json({message: "Transaction not found"});
        }

        res.status(200).json({message: "Transaction deleted successfully"});
    } catch (error){
        console.log("Error deleting the transaction", error);
        res.status(500).json({message: "Internal server error"});
    }
})

app.get("/api/transactions/summary/:userId", async (req, res) => {
    try {
        const {userId} = req.params;

        const balanceResult = await sql`SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions
            WHERE user_id = ${userId}`;

        const incomeResult = await sql`SELECT COALESCE(SUM(amount), 0) AS income FROM transactions
            WHERE user_id = ${userId} AND amount > 0`;

        const expenseResult = await sql`SELECT COALESCE(SUM(amount), 0) AS expense FROM transactions
            WHERE user_id = ${userId} AND amount < 0`;

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense,
        });
    } catch (error) {
        console.log("Error fetching the transaction summary", error);
        res.status(500).json({message: "Internal server error"});
    }
})


initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is up and running on PORT:", PORT)
    });
});

