const express = require("express");
// Initialize app variable with express
const app = express();
// create a single endpoint
app.get("/", (req, res) => res.send("API Running"));
// If no env variable default the server to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
