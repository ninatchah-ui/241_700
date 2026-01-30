//ทำการ import modlules http
const http = require('http');
const host = "localhost";
const port = 8000;

//กำหนดค่า server
const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("Hello, World! This is my first server.");
};
const server = http.createServer(requestListener);

//เริ่ม server    
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
}
);