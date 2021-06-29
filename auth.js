import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    const token = req.header('x-auth-token')
    if(!token) res.status(401).json({msg : 'No token, authorisation denied'})
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_OR_KEY)
        req.user = decoded 
        next()
    } catch(err) {
        res.status(400).json({msg : 'Token is not valid'})
    }
}

export default auth 