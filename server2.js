const express = require("express");
const res = require("express/lib/response");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) =>{
    res.send("hellllllo");
});

app.listen(PORT, () =>{
    console.log(`server run  on port ${PORT}`);
})