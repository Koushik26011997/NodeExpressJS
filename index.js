const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const app = express();
const authRouter = require("./routes/auth");
const port = process.env.PORT || 8000;

dotenv.config();

app.use(express.json());
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "./uploads"),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
  })
);

mongoose.connect(
  "mongodb+srv://NodeXUser:NodeXUser@cluster0.pij5u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    console.log("MongoDB is connected successfully.");
  }
);

cloudinary.config({
  cloud_name: "daej7rmtj",
  api_key: "122323692313115",
  api_secret: "nAClJpnjwrJ3QOTjYMGHmNeT9J0",
});

app.use("/api/user", authRouter);
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
