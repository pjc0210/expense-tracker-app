import {neon} from "@neondatabase/serverless";
import "dotenv/config";

// creates SQL connection using our database URL
export const sql = neon(process.env.DATABASE_URL);