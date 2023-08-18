const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);

  const todoList = document.getElementById("todoList");
  const todoInput = document.getElementById("todoInput");
  const addButton = document.getElementById("addButton");
  const updateForm = document.querySelector(".update-form");
  const updateInput = document.getElementById("updateInput");
  const updateButton = document.getElementById("updateButton");
  const signUpForm = document.getElementById("signUpForm");
  const signInForm = document.getElementById("signInForm");
  const userDisplay = document.getElementById("userDisplay");
  const signOutButton = document.getElementById("signOutButton");
  
  let todos = [];
  let currentUser = null;
  
  const database = firebase.database();
  const todosRef = database.ref("todos");
  
  // Auth state change listener
  firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
      userDisplay.textContent = `Logged in as: ${user.email}`;
      userDisplay.style.display = "block";
      signOutButton.style.display = "block";
      signUpForm.style.display = "none";
      signInForm.style.display = "none";
      fetchTodos();
    } else {
      userDisplay.style.display = "none";
      signOutButton.style.display = "none";
      signUpForm.style.display = "block";
      signInForm.style.display = "block";
      todoList.innerHTML = "";
    }
  });
  
  // Sign up
  function signUp() {
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        // User successfully signed up
        // You can perform further actions here
      })
      .catch(error => {
        alert(error.message);
      });
  }
  
  // Sign in
  function signIn() {
    const email = document.getElementById("signInEmail").value;
    const password = document.getElementById("signInPassword").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        // User successfully signed in
        // You can perform further actions here
      })
      .catch(error => {
        alert(error.message);
      });
  }
  
  // Sign out
  function signOut() {
    firebase.auth().signOut();
  }
  
  // Fetch todos from Firebase and render
  function fetchTodos() {
    todosRef.orderByChild("userId").equalTo(currentUser.uid).on("value", snapshot => {
      todos = [];
      snapshot.forEach(childSnapshot => {
        const todo = childSnapshot.val();
        todos.push({ key: childSnapshot.key, text: todo.text });
      });
      renderTodos();
    });
  }
  
  addButton.addEventListener("click", addTodo);
  updateButton.addEventListener("click", updateTodo);
  
  function renderTodos() {
    todoList.innerHTML = "";
    todos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${todo.text}</span>
        <span class="delete-button" onclick="deleteTodo('${todo.key}')">Delete</span>
        <span class="edit-button" onclick="editTodo('${todo.key}', '${todo.text}')">Edit</span>
      `;
      todoList.appendChild(li);
    });
  }
  
  function addTodo() {
    const text = todoInput.value.trim();
    if (text !== "") {
      todosRef.push({ text });
      todoInput.value = "";
    }
  }
  
  function updateTodo() {
    const newText = updateInput.value.trim();
    const todoKey = updateButton.dataset.key;
    if (newText !== "" && todoKey !== undefined) {
      todosRef.child(todoKey).update({ text: newText });
      updateForm.style.display = "none";
      updateInput.value = "";
    }
  }
  
  function editTodo(key, text) {
    updateButton.dataset.key = key;
    updateForm.style.display = "block";
    updateInput.value = text;
  }
  
  function deleteTodo(key) {
    todosRef.child(key).remove();
  }
  
  // Initial rendering
  renderTodos();
