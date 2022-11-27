//DEPENDECIES:
const express = require ( 'express');
const cors = require ( 'cors' );
const mysql = require ( 'mysql2' );
require ('dotenv').config ();

//APP INSTANCES:
const app = express();

//APP SETTINGS:
app.use ( express.json ());
app.use ( express.urlencoded ( { extended: true } ));
app.use ( cors ());


//DATABASE INSTANCE:
const db = mysql.createConnection( {
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
});

//CONNECT TO DB:
db.connect ( (err) => {
    if (err){
        console.log(err);
        // return {
        //         status: 'error',
        //         error: err.message
        //     };
        return;
    };
    console.log ('DB Connected')
    // return{
    //     status: 'success',
    //     message: 'Database created successfully'
    // };
});


//ENDPOINTS:

//CREATE DATABASE IF NOT EXISTS:
app.post ( '/create-database', (req, res) => {
    const dbCreationQuery = `CREATE DATABASE ${req.body.database}`;
    db.query (dbCreationQuery, (err, rows) => {
        if (err) {
            res
            .status(500)
            .json ({
                status: 'error',
                error: err.message
            });
            return;
        };
        process.env.DB_NAME = req.body.database;
        res
        .status(200)
        .json ( {
            status: 'success',
            temp: process.env.DB_NAME,
            message: `${req.body.database} was successfully created`,
            data: rows ,
        });
    });
});

//CREATE TABLE IF NOT EXISTS:
app.post('/create-table', ( req, res) => {
    const tableCreationQuery = `
    CREATE TABLE ${req.body.dbTable}(
        id int AUTO_INCREMENT,
        first_name VARCHAR(26),
        last_name VARCHAR(26),
        designation VARCHAR(255),
        DEPTH VARCHAR(6),
        PRIMARY KEY (id))`;
    db.query(tableCreationQuery, (err, rows) => {
        if (err) {
            res
            .status(500)
            .json ( {
                status: 'error',
                error: err.message,
            });
            return;
        };
        res
        .status (200)
        .json ( {
            status: 'success',
            temp: process.env.DB_NAME,
            message: `${req.body.dbTable} was successfully created`,
            data: rows,
        });
    });
});
//LAUNCH SERVER:
app.listen (process.env.PORT, () => {
    console.log(`APP LISTENING ON PORT ${process.env.PORT}`);
});
