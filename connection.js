const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "mamok639",
    database: "postgres"
})

module.exports = client