const http = require("http");
const url = require("url");
const fs = require("fs");

const studentOverview = fs.readFileSync(
  `${__dirname}/templates/students-overview.html`,
  `utf-8`
);
const studentCard = fs.readFileSync(
  `${__dirname}/templates/student-card.html`,
  `utf-8`
);
const studentProfile = fs.readFileSync(
  `${__dirname}/templates/student.html`,
  `utf-8`
);

const replaceTemplate = (temp, student) => {
  let output = temp.replace(/{%STUDENTNAME%}/g, student.studentName);
  output = output.replace(/{%STUDENTSURNAME%}/g, student.studentSurname);
  output = output.replace(/{%ID%}/g, student.id);
  output = output.replace(/{%SCORE%}/g, student.score);
  output = output.replace(/{%BIRTHDATE%}/g, student.birthDate);
  output = output.replace(/{%SERIANO%}/g, student.seriaNo);
  output = output.replace(/{%IMAGE%}/g, student.imageUrl);
  return output;
};

const data = fs.readFileSync(`${__dirname}/devdata/data.json`, `utf-8`);
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // STUDENT LIST
  if (
    pathname === "/overview" ||
    pathname === "/" ||
    pathname === "students-overview.html"
  ) {
    res.writeHead(200, { "Content-type": "text/html" });

    let sortedData = dataObj;
    if (query.sort === "score") {
      const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
      sortedData = dataObj.sort((a, b) => sortOrder * (a.score - b.score));
    }

    if (query.top === "5") {
      sortedData = sortedData.sort((a, b) => b.score - a.score).slice(0, 5);
    }

    const cardsHtml = sortedData.map((el) => replaceTemplate(studentCard, el)).join("");
    const output = studentOverview.replace("{%STUDENT_CARDS%}", cardsHtml);
    res.end(output);
  }
  else if (pathname === "/student") {
    res.writeHead(200, { "Content-type": "text/html" });

    const student = dataObj[query.id];
    const output = replaceTemplate(studentProfile, student);
    res.end(output);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Hello world",
    });
    res.end('<h1 style="color:red;">Page not found</h1>');
  }
});

server.listen(27002, "127.0.0.1", () => {
  console.log("Listening to requests on port 27002");
});
