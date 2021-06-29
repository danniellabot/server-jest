import { compare, hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './models/User'

export const register = async (req, res, next) => {
    // TODO add check if user already exists
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            "message":
                "Missing fields"
        })
    }
    const hashed = await hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashed,
    });

    await newUser.save();
    return res.status(200).json({ "message": `Thanks for registering ${name}` });
};

export const login = async (req, res) => {

    // missing password
    if (!req.body.password || !req.body.email) {
        return res.status(400).json({
            "message":
                "Please enter all fields"
        })
    }

    const user = await User.findOne({
        email: req.body.email,
    });

    // cant find a user
    if (!user) {
        return res.status(400).json({
            "message":
                "User doesn't exist!"
        })
    }

    const cmp = await compare(req.body.password, user.password);

    // found a user with an incorrect password
    if (!cmp) {
        return res.status(400).json({
            "message":
                "Incorrect password!"
        })
    }

    if(cmp && user) {
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        //const generateToken = (payload) => jwt.sign(payload, `${process.env.JWT_SECRET_KEY}`)
        const accessToken = jwt.sign(payload, `${process.env.JWT_SECRET_KEY}`)
        //const accessToken = generateToken(payload)
        return res.status(200).json({
            accessToken,
            payload,
        });
    }
   
};
