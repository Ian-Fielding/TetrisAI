const express = require("express");
const app = express();
const port = 5000;
app.use(express.static("tetrisHelpers"));
app.use(express.json());

app.listen(port, function() {
    console.log(`App listening at http://localhost:${port}`);
});