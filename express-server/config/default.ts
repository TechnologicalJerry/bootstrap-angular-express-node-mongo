export default {
    port: process.env.PORT || 9000,
    databaseHost: process.env.DATABASE_HOST || 'localhost:27017',
    databaseName: process.env.DATABASE_NAME || 'bootstrap-angular-express-node-mongo'
}