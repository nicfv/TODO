import { Task } from './Task.js';
import { TodoList } from './Todo.js';

window.onload = init;

/**
 * General helper functions.
 */
const el = id => document.getElementById(id),
    showAll = () => !el('filter').checked,
    startDate = () => new Date(el('start').value).getTime() || 0,
    endDate = () => (new Date(el('end').value).getTime() + 24 * 60 * 60 * 1000) || 0,
    getDesc = () => el('desc').value,
    getPID = () => +el('pids').value;

/**
 * Initialize event handlers.
 */
function init() {
    el('save').onclick = save;
    el('load').onclick = open;
    el('new').onclick = showNewForm;
    el('start').onchange = refresh;
    el('end').onchange = refresh;
    el('filter').onchange = refresh;
    el('close').onclick = closeForm;
    el('desc').oninput = editedDesc;
    el('assn').onclick = newTask;
    closeForm();
}

/**
 * Generate and save the to-do list as a JSON file.
 */
function save() {
    if (window.showSaveFilePicker) {
        console.log('File Picker');
        (async function () {
            const data = new Blob([TodoList.getJSON()], { 'type': 'application/json' }),
                handle = await showSaveFilePicker({ 'suggestedName': 'todo', 'types': [{ 'description': 'JSON file', 'accept': { 'application/json': ['.json'] } }] }),
                writable = await handle.createWritable();
            await writable.write(data);
            writable.close();
        })();
    } else {
        console.log('Classic');
        const data = new Blob([TodoList.getJSON()], { 'type': 'application/json' }),
            savedFile = window.URL.createObjectURL(data),
            downloadElement = document.createElement('a');
        downloadElement.download = 'todo.json';
        downloadElement.href = savedFile;
        downloadElement.click();
        window.URL.revokeObjectURL(savedFile);
    }
}

/**
 * Open and load a to-do list JSON file.
 */
function open() {
    if (window.showOpenFilePicker) {
        console.log('File Picker');
        (async function () {
            const [handle] = await showOpenFilePicker({ 'types': [{ 'description': 'JSON files', 'accept': { 'application/json': '.json' } }] }),
                file = await handle.getFile(),
                reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => TodoList.load(JSON.parse(reader.result), refresh);
        })();
    } else {
        console.log('Classic');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.click();
        fileInput.onchange = () => {
            const reader = new FileReader();
            reader.readAsText(fileInput.files[0]);
            reader.onload = () => TodoList.load(JSON.parse(reader.result), refresh);
        };
    }
}

/**
 * Assign a new task to the to-do list.
 */
function newTask() {
    show(TodoList.newTask(getDesc(), getPID()));
    refresh();
}

/**
 * This function is raised when the description is updated for any task.
 */
function editedDesc() {
    el('assn').disabled = !getDesc();
    el('updt').disabled = false;
}

/**
 * Create a line item for the current task.
 */
function getLineItem(task) {
    if (!(task instanceof Task)) { return; }
    const item = document.createElement('button');
    if (task.isComplete()) {
        const strikethrough = document.createElement('s');
        strikethrough.innerText = task.toString();
        item.appendChild(strikethrough);
    } else {
        item.innerText = task.toString();
    }
    item.onclick = () => show(task.id);
    return item;
}

/**
 * Regenerate the to-do task list.
 */
function refresh() {
    removeAllChildren(el('todo'));
    TodoList.forEach(task => el('todo').appendChild(getLineItem(task)), showAll(), startDate(), endDate());
}

/**
 * Show the details of a to-do task item.
 */
function show(id = 0) {
    const task = TodoList.findTask(id);
    if (task instanceof Task) {
        const updateDesc = () => {
            task.desc = getDesc();
            el('updt').disabled = true;
            refresh();
        }, completeTask = () => {
            task.complete();
            refresh();
            show(id);
        }
        showForm(task.toString(), task.getTimeRange(), task.hasParent(), () => task.hasParent() && show(task.pid), task.desc, !task.isComplete(), false, !task.isComplete(), false, updateDesc, !task.isComplete(), !task.isComplete(), completeTask, false, false);
    } else {
        throw new Error('No task found with id ' + id + '.');
    }
}

/**
 * Show a form ready to accept data for a new to-do task item.
 */
function showNewForm() {
    showForm('', '', false, null, '', true, true, false, false, null, false, false, null, true, false);
}

/**
 * Show the form and customize which controls are shown and enabled.
 */
function showForm(name = '', date = '', parentVisible = false, parentOnClick = () => { }, description = '', descriptionEnabled = false, parentIDsVisible = false, updateVisible = false, updateEnabled = false, updateOnClick = () => { }, completeVisible = false, completeEnabled = false, completeOnClick = () => { }, assignVisible = false, assignEnabled = false) {
    el('form').hidden = false;
    el('name').innerText = name;
    el('name').hidden = !name;
    el('date').innerText = date;
    el('date').hidden = !date;
    el('pare').hidden = !parentVisible;
    el('pare').onclick = parentOnClick;
    el('desc').value = description;
    el('desc').readOnly = !descriptionEnabled;
    el('pids').hidden = !parentIDsVisible;
    el('updt').hidden = !updateVisible;
    el('updt').disabled = !updateEnabled;
    el('updt').onclick = updateOnClick;
    el('cmpl').hidden = !completeVisible;
    el('cmpl').disabled = !completeEnabled;
    el('cmpl').onclick = completeOnClick;
    el('assn').hidden = !assignVisible;
    el('assn').disabled = !assignEnabled;
    setParentIDs();
}

/**
 * Close the form.
 */
function closeForm() {
    el('form').hidden = true;
}

/**
 * Remove all children from an HTML element.
 */
function removeAllChildren(element) {
    while (element instanceof Element && element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Clear all parent IDs from the dropdown menu.
 */
function clearParentIDs() {
    removeAllChildren(el('pids'));
    const defaultOption = document.createElement('option');
    defaultOption.innerText = 'No Parent';
    defaultOption.value = 0;
    el('pids').appendChild(defaultOption);
}

/**
 * Set all available parent IDs in the dropdown menu.
 */
function setParentIDs() {
    clearParentIDs();
    TodoList.forEach(task => {
        if (task instanceof Task) {
            const option = document.createElement('option');
            option.innerText = task.toString();
            option.value = task.id;
            el('pids').appendChild(option);
        }
    }, false);
}
