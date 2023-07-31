const submitTodoNode = document.getElementById("submitTodo");
const userInputNode = document.getElementById("userInput");
const prioritySelectorNode = document.getElementById("prioritySelector");
const todoListNode = document.getElementById("todo-item");


function showTodoInUI(todo) {
  const todoTextNode = document.createElement("li");
  const node = document.createElement("div");
  const img=document.createElement("img");
  img.src=todo.pic;
  img.className="pic";
  const span=document.createElement("span");
  
  
  todoTextNode.innerText = todo.todoText;
  todoListNode.appendChild(node);
  span.appendChild(img);
  node.appendChild(span);
  node.appendChild(todoTextNode);
  var x = document.createElement("INPUT");
  x.setAttribute("type", "checkbox");
  x.className = "checkbox";

  node.appendChild(x);
  let text = document.createElement("p");
  text.innerText = todo.priority;
  text.className = "priority";
  node.appendChild(text);
  const deleteItem = document.createElement("button");
  deleteItem.setAttribute('id', 'delete-btn');
  deleteItem.innerText = "Delete";
  node.appendChild(deleteItem);

  if(todo.completed){
    todoTextNode.style.textDecoration = "line-through";
    x.checked=true;
   // text.innerHTML = "complete";
  }else{
    todoTextNode.style.textDecoration = "none";
  }
  deleteItem.addEventListener('click', function () {
    deleteItemTodo(todo);
  })
  x.addEventListener("change", () => {
    if (x.checked) {
      updateStatus(todo.userid, todo);
      todoTextNode.style.textDecoration = "line-through";
    } else {
      text.innerHTML = todo.priority;
      console.log("im incomplete");
      updateStatus(todo.userid, todo);
      todoTextNode.style.textDecoration = "none";
    }
  });
  const hr=document.createElement("hr");
  node.appendChild(hr);

}
function deleteItemTodo(todo){
    console.log(todo);
    fetch("/delete",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify(todo)
    }).then(function(response){
        if(response.status===200){
            console.log("saved");
            newTodo();
        }else if(response.status===400){
            alert("Please login to delete todo");
        }
        (err)=>{
            alert("Error while deleting todo");
        }
    }).catch(function(err){
        alert("Error while deleting todo");
    }
    )

}

function updateStatus(id, todo) {
  console.log(JSON.stringify(todo));
  fetch(`/update`, {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  }).then(function (response) {
    console.log("then")
    if (response.status === 200) {
      console.log("saved");
    } else if(response.status===401){
      alert("Please login to update todo");
    } else(err) => {
      alert("Error while updating todo");
    }
  }).catch(function (err) {
    alert("Error while updating todo");

  }
  )
}
function newTodo() {
  fetch("/todo-data")
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if(response.status===400){
        alert("Please login to add todo");
        }else
         {
        alert("something weird happened");
      }
    })
    .then(function (todos) { 
     todoListNode.innerHTML = ""; 
      todos.forEach(function (todo) {
      showTodoInUI(todo);
      });
    }).catch(function (err) { 
      alert("Error while updating todo");
    })
}
  fetch("/todo-data")
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else {
      alert("something weird happened");
    }
  })
  .then(function (todos) {
    todos.forEach(function (todo) {
      showTodoInUI(todo);
    });
  });


