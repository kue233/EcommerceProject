const mongoose = require("mongoose");
const { MONGO_URI } = process.env;

mongoose.connect(MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true, },
    (error, client) => {
        if (error) console.log(error)
        else console.log("connected to the DB")
    }
)

module.exports = mongoose.connection;