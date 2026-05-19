
const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({ region: "eu-north-1" }); // change to your bucket's region
const BUCKET = "your-bucket-name"; // replace with your actual S3 bucket name

app.use(express.static(path.join(__dirname, "public")));

// Upload file
app.post("/upload", upload.single("file"), async (req, res) => {
  const params = {
    Bucket: BUCKET,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  await s3.upload(params).promise();
  res.json({ message: "Uploaded successfully" });
});

// List files
app.get("/files", async (req, res) => {
  const data = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
  const files = data.Contents.map((f) => ({ name: f.Key, size: f.Size }));
  res.json(files);
});

// Download file
app.get("/download/:name", (req, res) => {
  const params = { Bucket: BUCKET, Key: req.params.name };
  s3.getObject(params).createReadStream().pipe(res);
});

// Delete file
app.delete("/delete/:name", async (req, res) => {
  await s3.deleteObject({ Bucket: BUCKET, Key: req.params.name }).promise();
  res.json({ message: "Deleted" });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});