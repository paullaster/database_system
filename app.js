//DEPENDECIES:
const express = require ( 'express');
require ('dotenv').config ();

//APP INSTANCES:
const app = express();


//LAUNCH SERVER:
app.listen (process.env.PORT, () => {
    console.log(`APP LISTENING ON PORT ${process.env.PORT}`);
});
