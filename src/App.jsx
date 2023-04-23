import { useState, useEffect } from "react";
import "./App.css";

const useCardTransition = (timeToShow) => {
  const [invisible, setInvisible] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setInvisible(false);
    }, timeToShow);
  }, [invisible]);
  return invisible;
};

const Header = ({ numberOfTasks = 0 }) => {
  return (
    <div className="header">
      <h1 className="header-title">Task Manager</h1>
      <p className="header-taskcounter">Current tasks: {numberOfTasks}</p>
    </div>
  );
};

const Input = ({ placeholder, onInputFunction, value }) => (
  <input
    autoFocus
    className="input"
    placeholder={placeholder}
    onInput={({ target }) => onInputFunction(target.value)}
    value={value}
  />
);

const Button = ({
  children,
  action = () => console.warn("no action"),
  size = "regular",
  type = "remove",
}) => (
  <button
    className={`button ${
      ["small", "regular", "big"].includes(size) ? size : ""
    } ${["remove", "make", "edit"].includes(type) ? type : ""}`.trim()}
    onClick={action}
  >
    {children}
  </button>
);

const TaskMaker = ({ updateTasks }) => {
  const [tasks, setTasks] = updateTasks;
  const [inputContent, setInputContent] = useState("");

  const handleButtonClick = () => {
    setTasks([
      ...tasks,
      {
        id: tasks.length ? tasks[tasks.length - 1].id + 1 : 0,
        content: inputContent ? inputContent : "Empty task",
        editMode: false,
        done: false,
      },
    ]);
    setInputContent("");
  };

  return (
    <div className="task-maker">
      <Input
        onInputFunction={setInputContent}
        value={inputContent}
        placeholder="Task name"
      />
      <Button action={handleButtonClick} type="make">
        Add new task
      </Button>
    </div>
  );
};

const TaskManager = ({ updateTasks }) => {
  const [tasks, _] = updateTasks;
  if (tasks.length === 0) {
    return (
      <div className="task-manager">
        <Task taskContent="No tasks to do yet." hasRemoveButton={false} />
      </div>
    );
  }
  return (
    <div className="task-manager">
      {tasks.map((task) => (
        <Task
          key={task.id}
          id={task.id}
          taskContent={task.content}
          taskEditMode={task.editMode}
          taskDone={task.done}
          updateTasks={updateTasks}
          hasRemoveButton={true}
        />
      ))}
    </div>
  );
};

const Task = ({
  id = 0,
  taskContent = "no content",
  taskEditMode = false,
  taskDone = false,
  hasRemoveButton = true,
  updateTasks = [],
}) => {
  const [tasks, setTasks] = updateTasks;
  const [content, setContent] = useState(taskContent);
  const [editMode, setEditMode] = useState(taskEditMode);
  const [done, setDone] = useState(taskDone);
  // custom hooks for the task baby
  const invisible = useCardTransition(500);

  useEffect(() => {
    if (tasks) {
      const newTasks = [...tasks];
      let currentTask = tasks.findIndex((task) => task.id === id);
      newTasks[currentTask].content = content;
      newTasks[currentTask].editMode = editMode;
      newTasks[currentTask].done = done;
      setTasks(newTasks);
    }
  }, [content, editMode, done]);

  const handleRemoveButton = () => {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  };

  const handleEditButton = () => {
    setEditMode(!editMode);
  };

  const handleDoneButton = () => {
    setDone(!done);
  };

  return (
    <div className={`task ${invisible ? "invisible" : ""}`.trim()}>
      {editMode ? (
        <Input
          placeholder="New task name"
          onInputFunction={setContent}
          value={content}
        />
      ) : (
        <h3 className={`task-content ${done ? "done" : ""}`.trim()}>
          {content}
        </h3>
      )}
      {hasRemoveButton ? (
        <div className="task-button-container">
          {editMode ? null : (
            <Button type="make" size="small" action={handleDoneButton}>
              {done ? `Unmark as done` : `Mark as done`}
            </Button>
          )}
          {done ? null : (
            <Button type="edit" size="small" action={handleEditButton}>
              {editMode ? `Save` : `Edit`}
            </Button>
          )}
          <Button size="small" action={handleRemoveButton}>
            Remove task
          </Button>
        </div>
      ) : null}
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState(
    JSON.parse(window.localStorage.getItem("tasks")) || []
  );

  useEffect(() => {
    try {
      window.localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error(error);
    }
  }, [tasks]);

  return (
    <div className="app">
      <Header numberOfTasks={tasks.length} />
      <TaskMaker updateTasks={[tasks, setTasks]} />
      <TaskManager updateTasks={[tasks, setTasks]} />
    </div>
  );
};

export default App;
