import aj from "../lib/arcjet.js";
import {isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try{
        const decision = await aj.protect(req);

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                return res.status(429).json({message: 'Too many requests, please try again later.'});
            }else if(decision.reason.isBot()){
                //additional check for spoofed bots
                if(isSpoofedBot(req)){
                    return res.status(403).json({message: 'Access denied: Spoofed bot detected.'});
                }else{
                    return res.status(403).json({message: 'Access denied: Bot traffic detected.'});
                }
            }else{
                return res.status(403).json({message: 'Access denied by Arcjet protection.'});
            }
        }
        next();

    }catch(err){
        console.log(`Arcjet middleware error: ${err.message}`);
        next();
    }
}