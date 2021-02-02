const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require('multer');

const port = 8000;

const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", upload.single('file'), (req, res) => {
  console.log(req.file);
  res.send("done");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
