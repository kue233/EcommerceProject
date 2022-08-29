const app = require("./app");
const port = process.env.PORT || 3000;

require("./db/db").once("open", () => {
    app.listen(port
        , () => {
            console.log(`Server is up and running on port ${port}.`);

        })
})