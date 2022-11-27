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
app.post ( '/createdatabase', (req, res) => {
    const sqlQuery = `CREATE DATABASE ${req.body.database}`;
    db.query (sqlQuery, (err, rows) => {
        if (err) {
            res
            .status(500)
            .json ({
                status: 'error',
                error: err.message
            });
            return;
        };
        res
        .status(200)
        .json ( {
            status: 'success',
            message: `${req.body.database} was successfully created`,
            data: rows ,
        });
    });
});

//LAUNCH SERVER:
app.listen (process.env.PORT, () => {
    console.log(`APP LISTENING ON PORT ${process.env.PORT}`);
});
