import  Jwt  from "jsonwebtoken";

const gentoken= (userID) => {
    return Jwt.sign({userID},process.env.JWT_SECRET,
    {
        expiresIn: "30d",
    });
}

export default gentoken