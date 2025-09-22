const http = require("http");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

let students = [];
let idCounter = 1;

const getRequestBody = (req) => (callback) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (err) {
      callback(err);
    }
  });
};

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url; 
  const getRequestBodyCurrying = getRequestBody(req);

  res.setHeader("Content-Type", "application/json");

  if (url === "/students" && method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify(students));

  } else if (url === "/students" && method === "POST") {
    getRequestBodyCurrying((err, data) => {
      if (err || !data.name) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Name is required" }));
      }
      const student = { id: idCounter++, name: data.name, image: null };
      students.push(student);
      res.writeHead(201);
      res.end(JSON.stringify(student));
    });

  } else if (url.startsWith("/students/") && method === "PUT") {
    const id = parseInt(url.split("/")[2]);
    getRequestBodyCurrying((err, data) => {
      if (err || !data.name) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Name is required" }));
      }
      const student = students.find((s) => s.id === id);
      if (!student) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: "Student not found" }));
      }
      student.name = data.name;
      res.writeHead(200);
      res.end(JSON.stringify(student));
    });

  } else if (url.startsWith("/students/") && method === "DELETE") {
    const id = parseInt(url.split("/")[2]);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: "Student not found" }));
    }
    students.splice(index, 1);
    res.writeHead(200);
    res.end(JSON.stringify({ message: `Student ID ${id} deleted` }));

  } else if (url.startsWith("/students/upload/") && method === "POST") {
    const id = parseInt(url.split("/")[3]);
    const student = students.find((s) => s.id === id);

    if (!student) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: "Student not found" }));
    }

    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

 const form = new formidable.IncomingForm({uploadDir: uploadDir});

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Error parsing form data" }));
      }

      if (!files.image) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "No image uploaded" }));
      }

      student.image = files.image.filepath; 
      res.writeHead(200);
      res.end(JSON.stringify({ message: "Image uploaded", student }));
    });

  }else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
