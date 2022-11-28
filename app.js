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
            message: `${req.body.database} was successfully created`,
            data: rows ,
        });
    });
});

//CREATE TABLE IF NOT EXISTS:
app.post('/create-table', ( req, res) => {
    db.query ("SHOW DATABASES", (err, rows) => {
        if (err) {
            res
            .status (500)
            .json ( {
                status: 'error',
                error: err.message,
            });
            return;
        };
       const dbToBeModified = rows.filter ( (row) => {
         return req.body.database === row.Database;
       });
       const tableCreationQuery = `
    CREATE TABLE ${dbToBeModified[0].Database}.${req.body.dbTable}(${req.body.fields})`;
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
            message: `${req.body.dbTable} was successfully created in ${dbToBeModified[0].Database} dababase`,
            data: rows,
        });
    });
    });
});

//INSERTING SINGLE RECORD INTO TABLE:
app.post ( '/insert-todb/one', ( req, res) => {
    let dataToInsert = {...req.body.data};
    db.query ( 'SHOW DATABASES', (err, rows) => {
        if (err) {
            res
            .status (500)
            .json ( { 
                status: 'error',
                error: err.message,
            });
            return;
        };
        const dbToBeModified = rows.filter ( (row) => {
            return req.body.database === row.Database;
        });
        db.query (`SHOW TABLES FROM ${dbToBeModified[0].Database};`, (err, rows) => {
            if (err) {
                res
                .status (500)
                .json ( {
                    status: 'error',
                    error: err,
                });
                return;
            };
            const tableToBeModified = rows.filter ( (row) => {
                for ( let prop  in row) {
                    return row[prop] === req.body.dbTable;
                };
            } );
            for ( let prop in tableToBeModified[0] ) {
                db.query ( `INSERT INTO ${dbToBeModified[0].Database}.${tableToBeModified[0][prop]} SET?`, 
                    dataToInsert, (err, result) => {
                        if ( err ) {
                            res
                            .status (500)
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
                            data: result
                        });
                    }
                );
            };
        } );
    });
});

//INSERTING MANY RECORDS INTO TABLE:
app.post ( '/insert-todb/many', ( req, res) => {
    const multipleDataToInsert = {...req.body.multipleData};
    for ( let data in multipleDataToInsert) {
        db.query ( 'SHOW DATABASES', ( err, rows) => {
            if ( err) {
                res
                .status ( 500 )
                .json ( {
                    status: 'error',
                    error: err.message,
                });
                return;
            };
            const dbToBeModified = rows.filter ( (row) => {
                return row.Database === req.body.database;
            } );
            db.query ( ` SHOW TABLES FROM ${dbToBeModified[0].Database}`, ( err, rows) => {
                if ( err) {
                    res
                    .status ( 500)
                    .json ( {
                        status: 'error',
                        error: err.message,
                    });
                    return;
                };
                const tableToBeModified = rows.filter ( (row) => {
                    for ( let prop in row ) {
                        return row[prop] === req.body.dbTable;
                    };
                } );
                for ( let prop in tableToBeModified[0] ) {
                    db.query ( ` INSERT INTO ${dbToBeModified[0].Database}.${tableToBeModified[0][prop]} SET?`,
                    multipleDataToInsert[data], ( err, rows) => {
                        if ( err) {
                            res
                            .status ( 500)
                            .json ( {
                                status: 'error',
                                error: err.message,
                            });
                            return;
                        };
                        res
                        .status (500)
                        .json ( {
                            status: 'success',
                            message: 'Data successfully saved to the database!',
                            data: rows,
                        } );
                    }
                    );
                };
            });
        });
    };
});


//READ DATA FROM TABLE:
app.get ( '/find/db/one', ( req, res) => {
    
    //Find a single database:
    if(!(req.body.database)) {
        res
        .status (404)
        .json ( {
            status: 'error',
            error: 'Please enter a database name',
        });
        return;
    };
    db.query ( ' SHOW DATABASES', (err, rows)  => {
        if ( err) {
            res
            .status (404)
            .json ( {
                status: 'error',
                error: err.message,
            });
            return;
        };
        const targetDb = rows.filter ( (db) => {
            return db.Database === req.body.database;
        });
        res.json ( targetDb );
    });
});

//UPDATE TABLE:
app.put ( '/update-todb', ( req, res) => {});

//DELETE FROM TABLE
app.post ( '/delete-fromdb', ( req, res) => {});


//LAUNCH SERVER:
app.listen (process.env.PORT, () => {
    console.log(`APP LISTENING ON PORT ${process.env.PORT}`);
});
