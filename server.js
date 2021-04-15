const express = require("express");
const connectDB = require("./config/db");
// Initialize app variable with express
const app = express();
// connect Database
connectDB();

// create a single endpoint
app.get("/", (req, res) => res.send("API Running"));

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

// If no env variable default the server to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
