import jwt from 'jsonwebtoken'
import { getAuthUser } from '../databases/auth.js'

export const verifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization')

    if(!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized'
        })
    }

    const token = authHeader.substring(7) // remove 'Bearer ' prefix
 
    try {
        const decodedToken = jwt.verify(token, 'my_secret_key')
 
        if(!await getAuthUser(decodedToken.sub)) {
            return res.status(401).json({
                error: 'Unauthorized'
            })
        }

        req.user = decodedToken.username
        next()
    } catch (err) {
        return res.status(401).json({
            error: 'Unauthorized'
        })
    }
}