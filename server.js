const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

connectDb();
app.use(cors());
app.use(express.json());
app.use("/api/contacts", require("./routes/contactsRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`app is running on the server ${port}`);
});
