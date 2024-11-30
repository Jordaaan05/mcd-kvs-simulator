/* 
    Controller for all auth requests
*/

const jwt = require("jsonwebtoken")
const { User } = require("../database/database")
const bcrypt = require("bcrypt")
const secretKey = process.env.SECRET_KEY || "correctHorseBatteryStaple" // PLEASE CONFIGURE THIS IN YOUR ENV FILE

const login = async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.findOne({ where: { username } })

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        const isPasswordValid = await user.isValidPassword(password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            secretKey,
            { expiresIn: '1h' }
        )

        res.json({ token })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}

const register = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ where: { username } })
        if (existingUser) {
            await res.status(400).json({ message: 'Username already exists' })
        }

        const newUser = await User.create({ 
            username,
            password,
            role: role || 'user'
        })
        return res.status(200).json({ message: 'Successfully created user:', username})
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports = {
    login,
    register,
    authenticateToken
}