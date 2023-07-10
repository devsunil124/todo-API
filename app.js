const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const app =  express();
const path = require("path");
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname,"todoApplication.db");
const intilizeDbAndServer = async () =>{
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/");
        });
    }catch(e){
        console.log(`DB error : ${e.message}`);
        process.exit(1);
    }
};
intilizeDbAndServer();

// API 1 ===============================================================

app.get("/todos/",async (request,response) =>{
    const {status} = request.query;
    const getTodo = `
    SELECT 
     *
    FROM 
     todo
    WHERE
     status = ${status};`;
    let todoArray = await db.all(getTodo);
    response.send(todoArray);
});