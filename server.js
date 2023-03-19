// express
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')

// const apollo
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')

// subscription
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const { readFileSync } = require('fs')
const { gql } = require('graphql-tag')
const connectDB = require('./db/connectDB')

const typeDefs = gql(readFileSync(`${__dirname}/graphql/schema/schema.graphql`, { encoding: 'utf-8' }))
const resolvers = require('./graphql/resolvers')
const dbMethods = require('./db/dbMethod')


async function start() {
    const app = express()
    app.use(express.json())

    const httpServer = createServer(app)
    const schema = makeExecutableSchema({ typeDefs, resolvers })

    try {
        const wsServer = new WebSocketServer({
            server: httpServer,
            path: '/graphql'
        })
        const serverCleanup = useServer({ schema }, wsServer)

        const server = new ApolloServer({
            schema,
            plugins: [
                ApolloServerPluginDrainHttpServer({ httpServer }),
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                await serverCleanup.dispose()
                            }
                        }
                    }
                }
            ]
        })

        await server.start()
        app.use('/graphql', cors(), expressMiddleware(server, {
            context: ({ req }) => ({ dbMethods, req })
        }))

        await connectDB(process.env.MONGO_URI)
        const PORT = process.env.PORT || 4000
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
        })
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

start()