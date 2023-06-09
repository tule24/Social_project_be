const User = require('../../models/User')
const { checkAuth, checkPassword, createRefreshJWT, createJWT } = require('../../helpers/authHelper')
const GraphError = require('../../errors')
const jwt = require('jsonwebtoken')

const authMethod = {
    // handle mutation
    regiser: async ({ name, password, email }) => {
        if (!name || !password || !email) {
            throw GraphError(
                "Please provide name, password & email",
                "BAD_REQUEST"
            )
        }

        const user = await User.findOne({ email })
        if (user) {
            throw GraphError(
                "Email already exist",
                "BAD_REQUEST"
            )
        }

        const newUser = await User.create({
            name,
            password,
            email
        })

        return newUser
    },
    login: async ({ email, password }) => {
        if (!email || !password) {
            throw GraphError(
                "Please provide email & password",
                "BAD_REQUEST"
            )
        }

        const user = await User.findOne({ email })
        if (!user) {
            throw GraphError(
                "Email not register",
                "BAD_REQUEST"
            )
        }

        const checkPass = await checkPassword(password, user.password)
        if (!checkPass) {
            throw GraphError(
                "Password not match",
                "UNAUTHORIZED"
            )
        }

        user.refreshToken = createRefreshJWT(user._id)
        await user.save()

        return {
            user,
            token: createJWT(user._id),
            refreshToken: user.refreshToken
        }
    },
    logout: async (req) => {
        const user = await checkAuth(req)
        user.refreshToken = null
        await user.save()
    },
    refreshToken: async (refreshToken) => {
        const user = await User.findOne({ refreshToken })
        if (!user) {
            throw GraphError(
                "Refreshtoken not exist",
                "UNAUTHENTICATED"
            )
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        user.refreshToken = createRefreshJWT(user._id)
        await user.save()

        return {
            user,
            token: createJWT(user._id),
            refreshToken: user.refreshToken
        }
    }
}

module.exports = authMethod