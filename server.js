const express = require("express");
const path = require("path");

const app = express();
const PORT = 5500;

app.use(express.static("public"));

app.listen( PORT, () => {
    console.log(`Server is running from http://localhost:${PORT}/`);
});