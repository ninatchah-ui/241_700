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



const cors = require('cors')
app.use(cors())

let users = [];
let counter = 1;

app.use(bodyParser.json());



//แบบเก่า
/*app.get('/testdb', (req, res) => {
    mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8700
    }).then((con) => {
        con
            .query('SELECT * FROM users')
            .then((results) => {
                res.json(results[0]);
            }).catch((err) => {
                res.json({ error: err.message });
            });
    })
})*/


let conn = null;
const initMySQL = async ()=>{
    conn = await mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'root',
        database:'webdb',
        port:8700
    });
    console.log('Connected to MySQL database');
}

//แบบใหม่ง่ายกว่า
/*app.get('/testdb-new', async (req, res) => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'webdb',
            port: 8700
        });
        const results = await conn.query('SELECT * FROM users');
        res.json(results[0]);
    } catch (err) {
        console.error('Error connecting to the database:',err);
        res.status(500).json({error:'Internal Sever Error'});
    }
})*/

// path: = GET /users สำหรับดึงข้อมูล users ทั้งหมด
app.get('/users',async(req,res)=>{
    const results = await conn.query('SELECT * FROM users');
    res.json(results[0]);
})

const validateData = (userData) => {
    let error = [];

    if (!userData.firstName) {
        error.push('กรุณากรอกชื่อ');
    }

    if (!userData.lastName) {
        error.push('กรุณากรอกนามสกุล');
    }

    if (!userData.age) {
        error.push('กรุณากรอกอายุ');
    }

    if (!userData.gender) {
        error.push('กรุณาเลือกเพศ');
    }

    if (!userData.interests) {
        error.push('กรุณาเลือกงานอดิเรก');
    }

    if (!userData.description) {
        error.push('กรุณากรอกคำอธิบาย');
    }

    return error;
};

const submitData = async () => {

    const firstNameDOM = document.querySelector('input[name=firstname]');
    const lastNameDOM = document.querySelector('input[name=lastname]');
    const ageDOM = document.querySelector('input[name=age]');
    const genderDOM = document.querySelector('input[name=gender]:checked');
    const interestDOMs = document.querySelectorAll('input[name=interests]:checked');
    const descriptionDOM = document.querySelector('textarea[name=description]');
    const messageDOM = document.getElementById('message');

    try {

        // รวม interests
        let interests = Array.from(interestDOMs).map(el => el.value).join(',');

        const userData = {
            firstName: firstNameDOM.value,
            lastName: lastNameDOM.value,
            age: ageDOM.value,
            gender: genderDOM ? genderDOM.value : '',
            description: descriptionDOM.value,
            interests: interests
        };

        console.log('submitData', userData);

        const errors = validateData(userData);

        if (errors.length > 0) {
            throw {
                message: 'กรอกข้อมูลให้ครบถ้วน',
                errors: errors
            };
        }

        const response = await axios.post('http://localhost:8000/users', userData);

        console.log('response', response);

        messageDOM.innerText = 'บันทึกข้อมูลสำเร็จ';
        messageDOM.className = 'message success';

    } catch (error) {

        console.log('error message:', error.message);

        let htmlData = '<div>';
        htmlData += `<p>${error.message || 'เกิดข้อผิดพลาด'}</p>`;

        if (Array.isArray(error.errors)) {
            htmlData += '<ul>';

            error.errors.forEach(err => {
                htmlData += `<li>${err}</li>`;
            });

            htmlData += '</ul>';
        }

        htmlData += '</div>';

        messageDOM.innerHTML = htmlData;
        messageDOM.className = 'message danger';
    }
};

// path: = POST /users สำหรับเพิ่มข้อมูล user ใหม่
app.post('/users',async(req,res)=>{
    try{
        let user = req.body;
        const errors = validateData(user);
        if(error.lenght>0) {
            throw {
                message : 'กรุณากรอกข้อมูลให้ครบถ้วน',
                errors: errors
            }
        }
        const results = await conn.query('INSERT INTO users SET ?',user);
        res.json({
        massage: 'User added successfully',
        data: results[0]
    });
    }catch(error){
        const errorMessage = error.message || 'Error adding user';
        const errors = error.errors || [];
        console.error('Error inserting user:',error);
        res.status(500).json({
            message: errorMessage,
            errors: errors
        });
    }
})

app.get('/users/:id',async(req,res)=>{
    try{
    let id = req.params.id;
    const results = await conn.query('SELECT * FROM users WHERE id = ?',id);
    if(results[0].length===0){
        throw { statusCode:404,message:'User not found'};
    }
    res.json(results[0]);
    }catch(error){
        console.log('Errir fetching user:',error);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message:error.message||'Error fetching user'
        });
    }
})


//path: = PUT /users/:id สำหรับอัพเดตหรือแก้ไขข้อมูลตาม id
app.put('/users/:id',async(req,res)=>{
    try{
        let id = req.params.id;
        let updateUser = req.body;
        const results = await conn.query('UPDATE user SET ? WHERE id = ?',[updateUser,id])
        res.json({
            message:'User updated successfully',
            data:results[0]
        })
    }catch(error){
        console.error('Error updating user:',error);
        res.status(500).json({message:'Error updating user'});
    }
})


app.delete('/users/:id',async(req,res)=>{
    try{
        let id = req.params.id;
        const results = await conn.query('DELETE FROM users WHERE id = ?',[id]);
        res.json({
            message:'Use delete successfully',
            data:results[0]
        });
    }catch(error){
        console.error('Error deleting user:',error);
        res.status(500).json({message:'Error deleting user'});
    }
})

app.post('/user',(req,res)=>{
    let user = req.body;
    user.id = counter
    counter += 1;
});




/**
 GET /users - ดึงข้อมูลผู้ใช้ทั้งหมด
 POST /users - เพิ่มผู้ใช้ใหม่
 GET /users/:id - ดึงข้อมูลผู้ใช้ตาม id
 PUT /users/:id - แก้ไขข้อมูลผู้ใช้ตาม id ที่บันทึก
 DELETE /users/:id - ลบผู้ใช้ตาม id ที่บันทึก
 */

// path: = POST /user
/*app.post('/user',(req, res)=>{
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

app.listen(port, async () => {
    await initMySQL();
    console.log(`Server is running on http://localhost:${port}`);
});