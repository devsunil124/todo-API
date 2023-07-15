const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const app =  express();
const path = require("path");
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname,"todoApplication.db");
const hasPriorityAndStatusProperties = (requestQuery) => {
 return (
  requestQuery.priority !== undefined && requestQuery.status !== undefined
 );
};

const hasPriorityProperty = (requestQuery) => {
 return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
 return requestQuery.status !== undefined;
};

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

app.get("/todos/", async (request, response) => {
 let data = null;
 let getTodosQuery = "";
 const { search_q = "", priority, status } = request.query;


 switch (true) {
  case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
   break;
  case hasPriorityProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
   break;

case hasStatusProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
   break;
  default:
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
 }


 data = await db.all(getTodosQuery);
 response.send(data);
});

// API 2==============================================================

app.get("/todos/:todoId/",async (request,response)=>{
    let { todoId } = request.params;
    let todoQuery = `
    SELECT * FROM todo WHERE id = ${todoId};`;
    data = await db.get(todoQuery);
    response.send(data);

});

//API 3 ========================================================
app.post("/todos/",async(request,response)=>{
    const {id,todo,priority,status}= request.body;
    const postTodoQuery = `
    INSERT INTO todo (id,todo,priority,status)
    VALUES (${id},'${todo}','${priority}','${status}');`;
    await db.run(postTodoQuery);
    response.send("Todo Successfully Added");
});

const hasTodo = (requestQuery) => {
 return requestQuery.todo !== undefined;
};
const hasPriority = (requestQuery)=>{
    return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery)=>{
    return requestQuery.status !== undefined;
};


// API 4 ==============================================================

app.put("/todos/:todoId/"), async(request,response)=>{
    let data = null;
    let getTodosQuery = "";
    //const { search_q = "", priority, status } = request.query;
    const {todoId} = request.params;
    const {status,priority,todo} = request.body;
    let resBody = "";

    switch(true){
    case hasPriority(request.body):
   getTodosQuery = `
   UPDATE todo SET priority = '${priority}'
   WHERE id = ${todoId};`;
   resBody = "Priority Updated";
   break;
   case hasStatus(request.body):
   getTodosQuery = `
   UPDATE todo SET status = '${status}'
   WHERE id = ${todoId};
   `;
   resBody = "Status Updated";
   break;
   case hasTodo(request.body):
   getTodosQuery =`
   UPDATE todo SET todo = '${todo}'
   WHERE id = ${todoId};
   `;
   resBody = "Todo Updated"
    break;
    }
    data = await db.run(getTodosQuery);
    response.send(resBody);


};

// API 5 =========================================================================

app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId} = request.params
    const deleteQuery = `
    DELETE * FROM todo WHERE id = ${todoId} ;`
    await db.run(deleteQuery);
    response.send("Todo Deleted");
});

module.exports = app;