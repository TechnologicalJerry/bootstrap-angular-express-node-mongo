export default {
    port: process.env.SERVER_PORT || 5050,
    databaseHost: process.env.DATABASE_HOST || 'localhost:27017',
    databaseName: process.env.DATABASE_NAME || 'bootstrap-angular-express-node-mongo'
}