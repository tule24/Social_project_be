const { checkAuth } = require('../../helpers/authHelper')
const { catchAsync } = require('../../helpers/catchAsync')
const { PubSub, withFilter } = require('graphql-subscriptions')
const pubsub = new PubSub()

const messageQuery = {
    getMessageRoom: catchAsync(async (_, { roomId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.getMessageRoom(user, roomId)
    })
}

const messageMutation = {
    createMessage: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.createMessage(user, args, pubsub)
    }),
    createMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.createMessageRoom(user, args)
    }),
    deleteMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.deleteMessageRoom(user, args)
    }),
    leaveMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.leaveMessageRoom(user, args)
    })
}

const messageSubscription = {
    messageCreated: {
        subscribe: withFilter(
            () => {
                return pubsub.asyncIterator('MESSAGE_CREATED')
            },
            (parent, _, { userId }) => {
                return parent.messageCreated.users.includes(userId)
            }
        )
    }
}

const messageResolver = {
    Message: {
        creator: catchAsync(async ({ creator, creatorId }, _, { userLoader }) => {
            if (creator) {
                return creator
            }
            const res = await userLoader.load(creatorId.toString())
            return res
        })
    },
    MessageRoom: {
        users: catchAsync(async ({ users }, _, { dbMethods }) => {
            return dbMethods.getUserLike(users)
        })
    }
}

module.exports = { messageQuery, messageMutation, messageSubscription, messageResolver }