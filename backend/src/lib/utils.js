import jwt from 'jsonwebtoken';

export const generateToken = (userId,res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d' //token valid for 7 days
    });

    // res.cookie('jwt', token, {
    //     maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in milliseconds
    //     httpOnly: true, //prevent XSS attack by not allowing JS to access cookies : cross site scripting
    //     sameSite: "Strict", //prevent CSRF attacks
    //     secure: process.env.NODE_ENV === 'production', //use secure cookies in production
    // });
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",   // FORCE NONE
        secure: true,       // MUST be true with sameSite none
    });


    return token;
}