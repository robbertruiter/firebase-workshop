const auth = firebase.auth();

const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const userDetails = document.getElementById("userDetails");

const editForm = document.getElementById("editForm");
const editInput = document.getElementById("editInput");
const editId = document.getElementById("editId");

const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => {
  auth.signInWithPopup(provider);
};
signOutBtn.onclick = () => {
  auth.signOut();
};

auth.onAuthStateChanged((user) => {
  if (user) {
    whenSignedIn.style.display = "block";
    whenSignedOut.style.display = "none";
    userDetails.innerHTML = `
      <p>
        <strong>Name:</strong> ${user.displayName}
      </p>
      <p>
        <strong>Email:</strong> ${user.email}
      </p>
    `;
  } else {
    whenSignedIn.style.display = "none";
    whenSignedOut.style.display = "block";
  }
});

const db = firebase.firestore();

const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

let todoRef; // reference to the todo collection. Starting point for CRUD
let unsubscribe; // reference to the unsubscribe function

auth.onAuthStateChanged((user) => {
  if (user) {
    todoRef = db.collection("todo-items");
    addTodoBtn.onclick = () => {
      if (todoInput.value) {
        todoRef.add({
          uid: user.uid,
          name: todoInput.value,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        todoInput.value = "";
      }
    };
    unsubscribe = todoRef
      .where("uid", "==", user.uid)
      .orderBy("createdAt")
      .onSnapshot((snapshot) => {
        const items = snapshot.docs.map((doc) => {
          return `<li>${doc.data().name} <button onClick="showEditForm('${
            doc.id
          }','${doc.data().name}')">Edit</button><button onClick="deleteItem('${
            doc.id
          }')">X</button></li>`;
        });
        todoList.innerHTML = items.join("");
      });
  } else {
    unsubscribe && unsubscribe();
  }
});

const deleteItem = (id) => {
  console.log({ id });
  db.collection("todo-items")
    .doc(id)
    .delete()
    .then(() => {
      console.log("Document successfully deleted!");
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });
};

const showEditForm = (id, name) => {
  editForm.style.display = "block";
  editInput.value = name;
  editId.value = id;
};

editForm.addEventListener("submit", (e) => {
  console.log({ e, editId: editId.value, editInput: editInput.value });
  e.preventDefault();
  db.collection("toto-items")
    .doc(editId.value)
    .update({
      name: editInput.value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log("Document successfully updated!");
      editForm.style.display = "none";
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });
});
