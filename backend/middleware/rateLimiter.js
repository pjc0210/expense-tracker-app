import rateLimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const {success} = await rateLimit.limit(`rate-limit-const`);
        // const {success} = await rateLimit.limit(`rate-limit-${userId}`);

        if (!success){
            return res.status(429).json({ message: "Too many requests, please try again later."});
        }

        next();
    } catch (error) {
        console.log("Rate limit error", error);
        next(error);
    }
}

export default rateLimiter;