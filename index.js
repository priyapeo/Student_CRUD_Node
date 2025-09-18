const http = require('http');
const url = require('url');

let students = []; // in-memory store
let idCounter = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  res.setHeader('Content-Type', 'application/json');

  // Helper: read request body
  const getRequestBody = (callback) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        callback(null, parsed);
      } catch (err) {
        callback(err);
      }
    });
  };

  // Routes
  if (path === '/students' && method === 'GET') {
    // List all students
    res.writeHead(200);
    res.end(JSON.stringify(students));

  } else if (path === '/students' && method === 'POST') {
    // Create student
    getRequestBody((err, data) => {
      if (err || !data.name) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: 'Name is required' }));
      }
      const student = { id: idCounter++, name: data.name };
      students.push(student);
      res.writeHead(201);
      res.end(JSON.stringify(student));
    });

  } else if (path.startsWith('/students/') && method === 'PUT') {
    // Update student
    const id = parseInt(path.split('/')[2]);
    getRequestBody((err, data) => {
      if (err || !data.name) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: 'Name is required' }));
      }
      const student = students.find(s => s.id === id);
      if (!student) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: 'Student not found' }));
      }
      student.name = data.name;
      res.writeHead(200);
      res.end(JSON.stringify(student));
    });

  } else if (path.startsWith('/students/') && method === 'DELETE') {
    // Delete student
    const id = parseInt(path.split('/')[2]);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: 'Student not found' }));
    }
    students.splice(index, 1);
    res.writeHead(200);
    res.end(JSON.stringify({ message: `Student ID ${id} deleted` }));
    
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
