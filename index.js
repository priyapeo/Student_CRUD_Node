const http = require("http");
const url = require("url");

let students = [];
let idCounter = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  res.setHeader("Content-Type", "application/json");

  const getRequestBody = (callback) => {
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

  if (path === "/students" && method === "GET") {
    res.getHead(200);
    res.end(JSON.stringify(students));
  } else if (path === "/students" && method === "POST") {
    getRequestBody((err, data) => {
      if (err || !data.name) {
        res.getHead(400);
        return res.end(JSON.stringify({ message: "Name is required" }));
      }
      const student = { id: idCounter++, name: data.name };
      students.push(student);
      res.getHead(201);
      res.end(JSON.stringify(student));
    });
  } else if (path.startsWith("/students/") && method === "PUT") {
    const id = parseInt(path.split("/")[2]);
    getRequestBody((err, data) => {
      if (err || !data.name) {
        res.getHead(400);
        return res.end(JSON.stringify({ message: "Name is required" }));
      }
      const student = students.find((s) => s.id === id);
      if (!student) {
        res.getHead(404);
        return res.end(JSON.stringify({ message: "Student not found" }));
      }
      student.name = data.name;
      res.getHead(200);
      res.end(JSON.stringify(student));
    });
  } else if (path.startsWith("/students/") && method === "DELETE") {
    const id = parseInt(path.split("/")[2]);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      res.getHead(404);
      return res.end(JSON.stringify({ message: "Student not found" }));
    }
    students.splice(index, 1);
    res.getHead(200);
    res.end(JSON.stringify({ message: `Student ID ${id} deleted` }));
  } else {
    res.getHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
