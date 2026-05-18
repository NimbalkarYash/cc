// ============================================================
// server.js - Student Management System Backend
// ============================================================
// TO CHANGE TO EMPLOYEE SYSTEM: Replace all occurrences of:
//   "Student" → "Employee"
//   "student" → "employee"
//   "StudentID" → "EmployeeID"
//   "TABLE_NAME" value below
// ============================================================

const express = require("express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(express.json());

// Serve frontend files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// STEP 1: CHANGE TABLE NAME HERE (only change needed for exam)
// ============================================================
const TABLE_NAME = "Students";
// For Employee system: const TABLE_NAME = "Employees";
// For Product system:  const TABLE_NAME = "Products";

// ============================================================
// STEP 2: DynamoDB connection
// AWS credentials are read automatically from:
//   - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
//   - OR ~/.aws/credentials file (after running "aws configure")
//   - OR EC2 IAM Role (when deployed on EC2)
// ============================================================
const client = new DynamoDBClient({
  region: "eu-north-1",
}); // Change region if needed
const db = DynamoDBDocumentClient.from(client);

// ============================================================
// ROUTES
// ============================================================

// GET all students
app.get("/api/students", async (req, res) => {
  try {
    const result = await db.send(new ScanCommand({ TableName: TABLE_NAME }));
    res.json(result.Items);
  } catch (err) {
    console.error("GET Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - add a new student
app.post("/api/students", async (req, res) => {
  try {
    const { name, course, marks } = req.body;
    const item = {
      studentID : uuidv4(), // Unique ID auto-generated
      name,
      course,
      marks,
    };
    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    res.json({ message: "Student added!", item });
  } catch (err) {
    console.error("POST Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - update an existing student by StudentID
app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, course, marks } = req.body;
    const params = {
      TableName: TABLE_NAME,
      Key: { studentID : req.params.id },
      UpdateExpression: "set #n = :n, course = :c, marks = :m",
      ExpressionAttributeNames: { "#n": "name" }, // "name" is reserved in DynamoDB
      ExpressionAttributeValues: { ":n": name, ":c": course, ":m": marks },
      ReturnValues: "UPDATED_NEW",
    };
    const result = await db.send(new UpdateCommand(params));
    res.json({ message: "Student updated!", result });
  } catch (err) {
    console.error("PUT Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - remove a student by StudentID
app.delete("/api/students/:id", async (req, res) => {
  try {
    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { studentID : req.params.id },
      })
    );
    res.json({ message: "Student deleted!" });
  } catch (err) {
    console.error("DELETE Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// START SERVER
// ============================================================
const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`DynamoDB Table: ${TABLE_NAME}`);
});
