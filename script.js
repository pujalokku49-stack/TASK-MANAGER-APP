
// Key used in LocalStorage
const STORAGE_KEY = "edzeeta_task_manager_tasks";

// Cached DOM elements
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const taskIdInput = document.getElementById("task-id");
const submitBtn = document.getElementById("submit-btn");
const taskListEl = document.getElementById("task-list");
const statsEl = document.getElementById("stats");
const filterButtons = document.querySelectorAll("[data-filter]");

// In-memory state
let tasks = [];
let currentFilter = "all";

// Utility to generate a simple unique id
function generateId() {
  return Date.now().toString();
}

// Load tasks from LocalStorage when page loads
function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  tasks = stored ? JSON.parse(stored) : [];
  renderTasks();
}

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Render tasks based on current filter
function renderTasks() {
  taskListEl.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "pending") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  if (filteredTasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted text-center";
    li.textContent = "No tasks to show.";
    taskListEl.appendChild(li);
  } else {
    filteredTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-start";
      if (task.completed) li.classList.add("completed");

      const contentDiv = document.createElement("div");
      contentDiv.className = "ms-2 me-auto";

      const titleSpan = document.createElement("span");
      titleSpan.className = "fw-semibold task-title";
      titleSpan.textContent = task.title;

      const metaDiv = document.createElement("div");
      metaDiv.className = "small text-muted";
      metaDiv.textContent =
        (task.description || "No description") + " • " + task.createdAt;

      const statusBadge = document.createElement("span");
      statusBadge.className =
        "badge rounded-pill bg-" + (task.completed ? "success" : "warning") + " badge-status ms-2";
      statusBadge.textContent = task.completed ? "Completed" : "Pending";

      contentDiv.appendChild(titleSpan);
      contentDiv.appendChild(statusBadge);
      contentDiv.appendChild(document.createElement("br"));
      contentDiv.appendChild(metaDiv);

      const btnGroup = document.createElement("div");
      btnGroup.className = "btn-group btn-group-sm";

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "btn btn-outline-success";
      toggleBtn.textContent = task.completed ? "Mark Pending" : "Complete";
      toggleBtn.onclick = () => toggleComplete(task.id);

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-outline-primary";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => startEdit(task.id);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-outline-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteTask(task.id);

      btnGroup.appendChild(toggleBtn);
      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);

      li.appendChild(contentDiv);
      li.appendChild(btnGroup);
      taskListEl.appendChild(li);
    });
  }

  updateStats();
}

// Update stats text
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  statsEl.textContent = `Total: ${total} • Pending: ${pending} • Completed: ${completed}`;
}

// Handle create or update on form submit
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    alert("Please enter a task title.");
    return;
  }

  const editingId = taskIdInput.value;

  if (editingId) {
    // Update existing task
    const index = tasks.findIndex((t) => t.id === editingId);
    if (index !== -1) {
      tasks[index].title = title;
      tasks[index].description = description;
    }
    submitBtn.textContent = "Add Task";
    taskIdInput.value = "";
  } else {
    // Create new task
    const newTask = {
      id: generateId(),
      title: title,
      description: description,
      completed: false,
      createdAt: new Date().toLocaleString(),
    };
    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  taskForm.reset();
});

// Start editing a task
function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  titleInput.value = task.title;
  descriptionInput.value = task.description || "";
  taskIdInput.value = task.id;
  submitBtn.textContent = "Update Task";
  titleInput.focus();
}

// Toggle completed state
function toggleComplete(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return;
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete a task
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

// Filter buttons (all / pending / completed)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.getAttribute("data-filter");
    renderTasks();
  });
});

// Initialize
loadTasks();
