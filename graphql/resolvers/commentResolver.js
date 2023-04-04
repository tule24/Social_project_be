const catchAsync = require('../../helpers/catchAsync')
const { checkAuth } = require('../../helpers/authHelper')
const { pushNoti } = require('../../graphql/resolvers/notificationResolver')


const commentQuery = {
    commentOfPost: catchAsync(async (_, { postId, page }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getCommentsOfPost(user._id, postId, page)
    }),
    commentById: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        await checkAuth(req)
        return await dbMethods.getCommentById(commentId)
    }),
    repliesOfComment: catchAsync(async (_, { commentId, page }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getRepliesOfComment(user._id, commentId, page)
    }),
    repliesById: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        await checkAuth(req)
        return await dbMethods.getRepliesById(commentId, repliesId)
    }),
}

const commentMutation = {
    createComment: catchAsync(async (_, { postId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createComment(user, postId, content, pushNoti)
    }),
    updateComment: catchAsync(async (_, { commentId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateComment(user, commentId, content)
    }),
    deleteComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteComment(user, commentId)
    }),
    likeComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.likeComment(user, commentId)
    }),
    unlikeComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.unlikeComment(user, commentId)
    }),

    createReplies: catchAsync(async (_, { commentId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createReplies(user, commentId, content)
    }),
    updateReplies: catchAsync(async (_, { commentId, repliesId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateReplies(user, commentId, repliesId, content)
    }),
    deleteReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteReplies(user, commentId, repliesId)
    }),
    likeReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.likeReplies(user, commentId, repliesId)
    }),
    unlikeReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.unlikeReplies(user, commentId, repliesId)
    }),
}

const commentResolver = {
    Comment: {
        creator: catchAsync(({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        totalReplies: ({ replies }) => {
            return replies.length
        },
        totalLike: ({ like }) => {
            return like.length
        },

    },
    Replies: {
        creator: catchAsync(({ creatorId }, _, { dbMethods }) => {
            return dbMethods.getUserById(creatorId)
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        totalLike: ({ like }) => {
            return like.length
        },
    }
}

module.exports = { commentQuery, commentMutation, commentResolver }