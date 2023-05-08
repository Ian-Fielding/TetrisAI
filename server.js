const express = require("express");
const app = express();
const port = 5000;
const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'homepage')));
app.use(express.json());

app.listen(port, function() {
    console.log(`App listening at http://localhost:${port}`);
});

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
});

[
    "style.css",
    "pixi.js",
    "gui.js",
    "tetris.js",
    "agents.js"
].forEach(function(com){
    app.get(`/tetrisHelpers/${com}`,function(req,res){
        res.sendFile(__dirname+`/tetrisHelpers/${com}`);
    });
})