/*//ทำการ import โมดูล http
const http = require('http');
const host = 'localhost';
const port = 8000;

//กำหนดค่า sever
const reqestListener = function(req,res){
    res.writeHead(200);
    res.end("Hello, World! This is my first sever.");
}

// run sever
const sever = http.createServer(reqestListener);
sever.listen(port,host,() =>{
    console.log(`Sever is running on http://${host}:${port}`);
})*/


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;
const mysql = require('mysql2/promise');
let users = [];
let counter = 1;
app.use(bodyParser.json());

/*
app.get('/testdb',(req,res)=>{
    mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8700
    }).then((con)=>{
        con
        .query('SELECT * FROM users')
        .then((results)=>{
            res.json(results[0]);
        }).catch((err)=>{
            res.json({error:err.message});
        });
    })
}) 

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); */

let conn = null;
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8700
    });
    console.log('Connected to MySQL database');
}
app.get('/testdb-new',async (req,res)=>{
    try {
        const conn = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'webdb',
            port: 8700
       })
        const results = await conn.query('SELECT * FROM users');
        res.json(results[0]);
    } catch (err) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }

})
app.get('/users', async (req, res) => {
    const results = await conn.query('SELECT * FROM users');
    res.json(results[0]);
})
app.post('/users', async (req, res) => {
    try {
        let user = req.body;
        const results = await conn.query('INSERT INTO users (firstname, lastname) VALUES (?, ?)', [user.firstname, user.lastname]);
        res.json({ 
            message: 'User added successfully', 
            data: results[0] });
    }
    catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM users WHERE id = ?', id);
        if (results[0].length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0][0]);

    }
    catch (error) {

        console.error('Error fetching user:', error);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ 
            message: error.message || 'Error fetching user' });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        let id = req.params.id; 
        let updateUser = req.body;
        const results = await conn.query('UPDATE users SET firstname = ?, lastname = ? WHERE id = ?', [updateUser.firstname, updateUser.lastname, id]);
        res.json({
            message: 'User updated successfully',
            data: results[0]
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM users WHERE id = ?', id);
        res.json({
            message: 'User deleted successfully',
            data: results[0]
        });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
});

/**
 GET /users - ดึงข้อมูลผู้ใช้ทั้งหมด
 POST /users - เพิ่มผู้ใช้ใหม่
 GET /users/:id - ดึงข้อมูลผู้ใช้ตาม id
 PUT /users/:id - แก้ไขข้อมูลผู้ใช้ตาม id ที่บันทึก
 DELETE /users/:id - ลบผู้ใช้ตาม id ที่บันทึก
 */

// path: = POST /user
app.post('/user',(req, res)=>{
    let user = req.body;
    user.id = counter
    counter +=1; //นับ id

    users.push(user);
    res.json({message:'User added successfully',users: user});
});

//path: = PUT /user/:id
app.patch('/user/:id',(req,res)=>{
    let id = req.params.id;
    let updateUser = req.body;
    
    // หา user จาก id ที่ส่งมา
    let selectedIndex = users.findIndex(user =>user.id == id);
    
    // update ข้อมูล user นั้น
    users[selectedIndex].firstname = updateUser.firstname || users[selectedIndex].firstname;
    users[selectedIndex].lastname = updateUser.lastname || users[selectedIndex].lastname;

    if(updateUser.firstname){
        users[selectedIndex].firstname = updateUser.firstname;
    }
    if(updateUser.lastname){
        users[selectedIndex].lastname = updateUser.lastname;
    }

    res.json({
        massage:'User update successfully',
        data:{
            user: updateUser,
            indexUpdate: selectedIndex
        }
    });
    // ส่งตัว users update เสร็จกลับไป
    
})

/*
app.delete('/users/:id',(req,res)=>{
    let id = req.params.id;
    let selectedIndex = users.findIndex(user=>user.id == id);
    delete users[selectedIndex];

    res.json({
        message: 'User deleted successfully!',
        indexDelete: selectedIndex
    })
})

// path: GET / users
app.get('/users',(req,res)=>{
    res.json(users);
});*/

app.listen(port,async()=>{
    await
    console.log(`Server is running on http://localhost:${port}`);
});
