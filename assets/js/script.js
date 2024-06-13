//references to important DOM elements
const timeDisplayEl = $("#time-display");
const taskDisplayEl = $("#task-display");
const taskFormEl = $("#taskForm");
const taskTitleInputEl = $("#task-title");
const taskDescriptionInputEl = $("#task-description");
const taskDateInputEl = $("#taskDueDate");

// modal
const modal = document.querySelector("#theModal");
const btn = document.querySelector(".btn");
const span = document.querySelector(".close")[0];

// Retrieve tasks and nextId from localStorage//////////////////done
function readTasksFromStorage() {
  let taskList = JSON.parse(localStorage.getItem("tasks"));
  let nextId = JSON.parse(localStorage.getItem("nextId"));
  if (!taskList) {
    taskList = [];
  }

  return { taskList, nextId };
}

////////////////////////done
function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Todo: create a function to generate a unique task id////////////////////done
function generateTaskId() {
  const timestamp = Date.now(); // Get the current timestamp
  const randomNum = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999

  return `${timestamp}-${randomNum}`;
}
const taskId = generateTaskId();
console.log(taskId);

// Todo: create a function to create a task card/////////////////done
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card task-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.type);
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

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const tasks = readTasksFromStorage();

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  // ? Loop through projects and create project cards for each status
  for (let task of tasks) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  // ? Use JQuery UI to make task cards draggable
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Todo: create a function to handle adding a new task////135//////done
function handleAddTask(event) {
  event.preventDefault();
  const taskTitle = taskTitleInputEl.val().trim();
  const taskDescription = taskDescriptionInputEl.val();
  const taskDate = taskDateInputEl.val();

  const newTask = {
    title: taskTitle,
    description: taskDescription,
    dueDate: taskDate,
    status: "to-do",
  };

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  // save the updated tasks array to localStorage
  saveTasksToStorage(tasks);

  // display task data to screen
  displayTaskData();

  // clear the form inputs
  taskTitleInputEl.val("");
  taskDescriptionInputEl.val("");
  taskDateInputEl.val("");
}

// Todo: create a function to handle deleting a task/////////////done
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
  const tasks = readTasksFromStorage();

  // ? Remove project from the array.
  tasks.forEach((task) => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  saveTasksToStorage(tasks);

  // ? Here we use our other function to print projects back to the screen
  displayTaskData();
}
// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // ? Read projects from localStorage
  const tasks = readtasksFromStorage();

  // ? Get the project id from the event
  const taskId = ui.draggable[0].dataset.taskId;

  // ? Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let task of tasks) {
    // ? Find the project card by the `id` and update the project status.
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTaskData();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

// ? Add event listener to the form element, listen for a submit event, and call the `handleProjectFormSubmit` function.
taskFormEl.on("submit", handleAddTask);

// ? Because the cards are dynamically added to the screen, we have to use jQuery event delegation to listen for clicks on the added cards delete button.
// ? We listen for a click on the parent element, and THEN check if the target of the click is the delete button. If it is, we call the `handleDeleteProject` function
taskDisplayEl.on("click", ".btn-delete-project", handleDeleteTask);

$(document).ready(function () {
  displayTaskData();

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

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
// span.onclick = function () {
//   modal.style.display = "none";
// };
