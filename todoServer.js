const express = require("express");
const fs = require("fs");
var session = require('express-session');
const multer = require('multer');

const app = express();


const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
})
const upload = multer({ storage: multerStorage });
app.set("view engine", "ejs");
app.use(upload.single('pic'));
app.use(express.static("uploads"));
app.use(session({
  secret: 'node.js',
  resave: false,
  saveUninitialized: true,
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.render("index",{username:req.session.username,pic:req.session.pic});
});


app.get("/styles.css", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoViews/styles.css");
});

app.get("/login", function (req, res) {
  
  res.render("login",{error:null});
});

app.get("/signup",function(req,res){

  res.render("signup");

})
app.get("/logout", (req, res) => {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  req.session.destroy();
  res.redirect("/login");
});
  
app.post("/signup",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  const email=req.body.email;
  const phone=req.body.phone;
  const pic = req.file;
  console.log(pic);
  const data={
      username:username,
      password:password,
      email:email,
      phone:phone,
      pic:pic.filename
  }
  saveUserinFile(data,function(err){
      if(err){
          if(err==="user already exists"){
              res.status(409).send("user already exists");
              return;
          }
          res.status(500).send("error");
          return;
      }
      res.redirect("/login");
  } 
  )
})
app.get("/upload",function(req,res){
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.render("index",{username:req.session.username,pic:req.session.pic});
})
app.post("/upload",function(req,res){
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
 
  const todoText = req.body.todoText;
  const priority = req.body.priority;
  const pic=req.file;
  //console.log(pic);
  
  if(!todoText || !priority ){
    res.status(400).send("error");
    return;
  }
  const data={
      userid: new Date().getTime().toString(),
      todoText,
      priority,
      completed:false,
      pic:pic.filename
  }
  saveTodoInFile(data,function(err){
      if(err){
          res.status(500).send("error");
          return;
      }
      res.redirect("/");
  } 
  )
})

app.post("/login", function (req, res) {
  
  const username = req.body.username;
  const password = req.body.password;
 

  readAllUser(function(err,data){
    if(err){
      
      res.status(500).send("error");
      return;
    }
    const user=data.find((user)=>{
      return user.username===username && user.password===password;
    })
    if(user){
      req.session.username = req.body.username;
      req.session.isLoggedIn = true;
      req.session.pic = user.pic;
     // console.log(user);
      res.render("index",{username:req.session.username,pic:req.session.pic});
    }else{
      res.render("login",{error:"Invalid username or password"});
    }
  } 
  )
});


app.post("/todo", function (req, res) {
  if(!req.session.isLoggedIn){
    res.status(401).send("unauthorized");
    return;
  }
  
  saveTodoInFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    res.status(200).send("success");
  });
});

app.get("/todo-data", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});
app.get("/todoScript.js", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoViews/todoScript.js");
});

app.post("/delete",function(req,res){
    if(!req.session.isLoggedIn){
      res.status(401).send("unauthorized");
      return;
    }
    const userid=req.body.userid;
   
    deleteItemTodo(userid,function(err){
        if(err){
            res.status(500).send("error");
            return;
        }
        res.status(200).send("success");
    })

})

app.post("/update", function (req, res) {
  if(!req.session.isLoggedIn){
    res.status(401).send("unauthorized");
    return;
  }
    const id=req.body.userid;
    updateTodoInFile(id, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).send("success");
    })
})
    

function updateTodoInFile(userId,callback) {
    readAllTodos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        const updatedData = data.map((todo) => {
            if (todo.userid == userId) {
              if(todo.completed!==true){
                todo.completed = true;
              }else{
                todo.completed = false;
              }
            }
            return todo;
        })
     
        fs.writeFile("./todo.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    })
}



function readAllTodos(callback) {
  fs.readFile("./todo.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    if (data.length === 0) {
      data = "[]";
    }
    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    data.push(todo);

    fs.writeFile("./todo.json", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}

function deleteItemTodo(userid,callback){
    console.log("userid"+userid);
    readAllTodos(function(err,data){
        if(err){
            callback(err);
            return;
        }
        const updatedData=data.filter((todoItem)=>{
            return todoItem.userid!==userid;
        })
        fs.writeFile("./todo.json", JSON.stringify(updatedData), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    })
}
app.listen(3000, function () {
  console.log("server on port 3000");
});

function readAllUser(callback){
    fs.readFile("./users.json","utf-8",function(err,data){
        if(err){
            callback(err);
            return;
        }
        if(data.length===0){
            data="[]";
        }
        try{
            data=JSON.parse(data);
            callback(null,data);
        }catch(err){
            callback(err);
        }
    })
}

function saveUserinFile(user,callback){
    let userexists=false;
    readAllUser(function(err,data){
        if(err){
            callback(err);
            return;
        }
        data.forEach((user1)=>{
         if(user1.username===user.username){
            userexists=true;
            return;
         }
      })
      if(!userexists){
        data.push(user);
        fs.writeFile("./users.json",JSON.stringify(data),function(err){
            if(err){
                callback(err);
                return;
            }
            callback(null);
        })
      }else{
        console.log("user already exists");
        callback("user already exists");
      }
    })
}
