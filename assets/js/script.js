//references to important DOM elements
const timeDisplayEl = $("#time-display");
const taskDisplayEl = $("#task-display");
const taskFormEl = $("#taskForm");
const taskTitleInputEl = $("#task-title");
const taskDescriptionInputEl = $("#task-description");
const taskDateInputEl = $("#taskDueDate");
const todoCardEl = $("#todo-cards");
// modal
const modal = document.querySelector("#theModal");
const btn = document.querySelector(".btn");

// Retrieve tasks and nextId from localStorage//////////////////
function readTasksFromStorage() {
  let taskList = JSON.parse(localStorage.getItem("tasks"));
  let nextId = parseInt(localStorage.getItem("nextId"));
  if (!taskList) {
    taskList = [];
  }
  if (!nextId) {
    nextId = 0;
  }

  return { taskList, nextId };
}

////////////////////////
function saveTasksToStorage(tasks, newNextId) {
  localStorage.setItem("nextId", newNextId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Todo: create a function to generate a unique task id////////////////////d
function generateTaskId() {
  const timestamp = Date.now(); // Get the current timestamp
  const randomNum = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999

  return `${timestamp}-${randomNum}`;
}
const taskId = generateTaskId();
console.log(taskId);

// Todo: create a function to create a task card/////////////////
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card task-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  // ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  // ? Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
}
function displayTaskData() {}
// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const { taskList } = readTasksFromStorage();

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  // Loop through tasks and create project cards for each status
  for (let task of taskList) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }
  console.log(todoList);

  // ? Use JQuery UI to make task cards draggable
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    // function to clone the card being dragged so that the original card remains in place
    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const taskTitle = taskTitleInputEl.val().trim();
  const taskDescription = taskDescriptionInputEl.val();
  const taskDate = taskDateInputEl.val();
  const { taskList, nextId } = readTasksFromStorage();
  let newNextId = nextId + 1;
  const newTask = {
    id: newNextId,
    title: taskTitle,
    description: taskDescription,
    dueDate: taskDate,
    status: "to-do",
  };

  taskList.push(newTask);

  // save the updated tasks array to localStorage
  saveTasksToStorage(taskList, newNextId);
  renderTaskList();
  // clear the form inputs
  taskTitleInputEl.val("");
  taskDescriptionInputEl.val("");
  taskDateInputEl.val("");
}

// Todo: create a function to handle deleting a task/////////////
function handleDeleteTask(event) {
  event.preventDefault();
  const taskId = $(this).attr("data-task-id");
  const { taskList } = readTasksFromStorage();

  // ? Remove project from the array.
  // taskList.forEach((task) => {
  //   if (task.id === taskId) {
  //     taskList.splice(taskList.indexOf(task), 1);
  //   }
  // });
  const newTaskList = taskList.filter((task) => task.id !== parseInt(taskId));
  saveTasksToStorage(newTaskList);

  // ? Here we use our other function to print projects back to the screen
  renderTaskList();
}

// function handleDeleteTask(event) {
//   event.preventDefault();
//   // get the task id from the button clicked
//   const taskId = $(this).attr("data-task-id");
//   // remove the task from the taskList, save and render
//   taskList = taskList.filter((task) => task.id !== parseInt(taskId));
//   localStorage.setItem("tasks", JSON.stringify(taskList));
//   renderTaskList();
// }

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // Read tasks from localStorage
  const { taskList } = readTasksFromStorage();

  // Get the task id from the event
  const taskId = ui.draggable[0].dataset.taskId;

  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let task of taskList) {
    //  Find the project card by the `id` and update the project status.
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  //  Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem("taskList", JSON.stringify(taskList));
  renderTaskList();
}
// function handleDrop(event, ui) {
//   // get the task id and new status from the event
//   const taskId = ui.draggable[0].dataset.taskId;
//   const newStatus = event.target.id;

//   for (let task of taskList) {
//     // update the task status of the dragged card
//     if (task.id === parseInt(taskId)) {
//       task.status = newStatus;
//     }
//   }
//   // save and render
//   localStorage.setItem('tasks', JSON.stringify(taskList));
//   renderTaskList();
// }

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

// Add event listener to the form element, listen for a submit event, and call the `handleAddTask` function.
taskFormEl.on("submit", handleAddTask);

// Because the cards are dynamically added to the screen, we have to use jQuery event delegation to listen for clicks on the added cards delete button.
// We listen for a click on the parent element, and THEN check if the target of the click is the delete button. If it is, we call the `handleDeleteTask` function
taskDisplayEl.on("click", ".btn-delete-project", handleDeleteTask);

$(document).ready(function () {
  renderTaskList();

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // ? Make lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
