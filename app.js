const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser'); //toget data in json format
const mysql = require('mysql'); //to communicate with mysql server
const router = express.Router();


require('dotenv').config();

const app = express(); //object of express
const port = process.env.PORT || 7000; //take default port / 7000

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//Static Files
app.use(express.static("public"));


//Template Engine - to render html
const handlebars = exphbs.create({extname:".hbs"});
app.engine('hbs',handlebars.engine);
app.set("view engine","hbs")

//MySQL
const con = mysql.createPool({
	connectionLimit:10,
	host : 'localhost',
	user : 'root',
	password : 'ypkesavan@123',
	database : 'management_node_app',
});

con.on('error', (err) => {
    console.error('Error in MySQL pool:', err);
});
con.getConnection((err, connection) => {
    if (err) {
        console.error('Error getting connection from pool:', err);
    } else {
        connection.query('select * from teachers', (err,rows) => {
            connection.release();
            if (!err) {
                console.error("No error",rows);
                app.get('/',(req,res)=>{
					res.render("home",{rows});
				});
            } else {
                console.log('Error', err);
            }
        });
        //console.log('Successful Connection');
    }
});

app.get('/adduser',(req,res)=>{
	res.render("adduser");
});
app.post('/adduser', (req, res) => {
    const { ID, Name, Age, Date_Of_Birth, Classes_Count } = req.body;

    con.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const sql = 'INSERT INTO Teachers(ID, Name, Age, Date_Of_Birth, Classes_Count) VALUES (?, ?, ?, ?, ?)';
            const values = [ID, Name, Age, Date_Of_Birth, Classes_Count];

            connection.query(sql, values, (err, rows) => {
                connection.release();

                if (!err) {
                    console.error('No error', rows);
                    res.render('adduser',{msg:"Details Added Successfully"}); // render success page or redirect
                } else {
                    console.log('Error', err);
                    res.status(500).send('Internal Server Error'); // render error page or send error response
                }
            });
        }
    });
});

app.get('/editteacher/:id', (req, res) => {
    con.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            res.status(500).send('Internal Server Error');
        } else {
            let id = parseInt(req.params.id); // Parse the ID to an integer

            connection.query('SELECT * FROM teachers WHERE id = ?', [id], (err, rows) => {
                connection.release();
                if (!err) {
                    console.error('No error', rows);
                    res.render('editteacher', { rows });
                } else {
                    console.log('Error', err);
                    res.status(500).send('Internal Server Error');
                }
            });
        }
    });
});
app.post('/editteacher/:id', (req, res) => {
    const { ID, Name, Age, Date_Of_Birth, Classes_Count } = req.body;

    con.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const sql = 'UPDATE teachers SET ID=?, Name=?, Age=?, Date_Of_Birth=?, Classes_Count=? WHERE ID=?';
 
            const values = [ID, Name, Age, Date_Of_Birth, Classes_Count,ID];

            connection.query(sql, values, (err, rows) => {
                connection.release();

                if (!err) {
                    console.error('No error', rows);
                    res.render('adduser', { msg: 'Details Updated Successfully', rows: req.body });

                } else {
                    console.log('Error', err);
                    res.status(500).send('Internal Server Error'); // render error page or send error response
                }
            });
        }
    });
});




// Event when a connection is acquired from the pool
con.on('acquire', (connection) => {
    console.log('Connection acquired from the pool: ', connection.threadId);
});



/*//Router
app.get('/',(req,res)=>{
	res.render("home");
}); //home page*/


//Listen Port
app.listen(port,()=>{
	console.log("Running on port: "+port);
});

