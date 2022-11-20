import { Task } from './Task.js';
import { TodoList } from './Todo.js';

window.onload = init;

/**
 * Represents the task that is currently selected.
 */
let currentTask = undefined;

/**
 * General helper functions.
 */
const el = id => document.getElementById(id),
    showIncomplete = () => el('filter_incm').checked,
    showCompleted = () => el('filter_cmpl').checked,
    showCancelled = () => el('filter_cncl').checked,
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
    el('filter_incm').onchange = refresh;
    el('filter_cmpl').onchange = refresh;
    el('filter_cncl').onchange = refresh;
    el('close').onclick = closeForm;
    el('pare').onclick = showParent;
    el('desc').oninput = editedDesc;
    el('updt').onclick = updateDesc;
    el('cncl').onclick = cancelTask;
    el('cmpl').onclick = completeTask;
    el('incm').onclick = incompleteTask;
    el('reas').onclick = reassignTask;
    el('assn').onclick = newTask;
}

/**
 * Generate and save the to-do list as a JSON file.
 */
function save() {
    if (window.showSaveFilePicker) {
        console.log('File Picker');
        (async function () {
            const data = new Blob([TodoList.getJSON()], { 'type': 'application/json' }),
                handle = await showSaveFilePicker({ 'suggestedName': 'todo', 'excludeAcceptAllOption': true, 'types': [{ 'description': 'JSON file', 'accept': { 'application/json': ['.json'] } }] }),
                writable = await handle.createWritable();
            await writable.write(data);
            writable.close();
            savedData();
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
        savedData();
    }
}

/**
 * Open and load a to-do list JSON file.
 */
function open() {
    if (window.showOpenFilePicker) {
        console.log('File Picker');
        (async function () {
            const [handle] = await showOpenFilePicker({ 'excludeAcceptAllOption': true, 'types': [{ 'description': 'JSON files', 'accept': { 'application/json': ['.json'] } }] }),
                file = await handle.getFile(),
                reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => TodoList.load(JSON.parse(reader.result), refresh);
            savedData();
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
            savedData();
        };
    }
}

/**
 * Assign a new task to the to-do list.
 */
function newTask() {
    show(TodoList.findTask(TodoList.newTask(getDesc(), getPID())));
    unsavedData();
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
 * Call this function when there is unsaved data. Prevents the user from accidentally losing unsaved data.
 */
function unsavedData() {
    el('load').disabled = true;
    el('save').disabled = false;
}

/**
 * Call this function after data is saved. Prevents the user from overwriting saved data.
 */
function savedData() {
    el('load').disabled = false;
    el('save').disabled = true;
}

/**
 * Update the description of the selected task.
 */
function updateDesc() {
    if (currentTask instanceof Task) {
        currentTask.desc = getDesc();
        el('updt').disabled = true;
        unsavedData();
        refresh();
        show(currentTask);
    } else {
        throw new Error('No task is selected.');
    }
}

/**
 * Cancel the selected task.
 */
function cancelTask() {
    if (currentTask instanceof Task) {
        currentTask.cancel();
        unsavedData();
        refresh();
        show(currentTask);
    } else {
        throw new Error('No task is selected.');
    }
}

/**
 * Mark the selected task as completed.
 */
function completeTask() {
    if (currentTask instanceof Task) {
        currentTask.complete();
        unsavedData();
        refresh();
        show(currentTask);
    } else {
        throw new Error('No task is selected.');
    }
}

/**
 * Mark the selected task as incomplete.
 */
function incompleteTask() {
    if (currentTask instanceof Task) {
        currentTask.incomplete();
        unsavedData();
        refresh();
        show(currentTask);
    } else {
        throw new Error('No task is selected.');
    }
}

/**
 * Reassign the selected task.
 */
function reassignTask() {
    if (currentTask instanceof Task) {
        currentTask.reassign();
        unsavedData();
        refresh();
        show(currentTask);
    } else {
        throw new Error('No task is selected.');
    }
}

/**
 * Show the parent task of the currently selected task, if one exists.
 */
function showParent() {
    if (!(currentTask instanceof Task)) {
        throw new Error('No task is selected.');
    } else if (!currentTask.hasParent()) {
        throw new Error('Current task does not have a parent.');
    } else {
        show(TodoList.findTask(currentTask.pid));
    }
}

/**
 * Create a line item for the current task.
 */
function getLineItem(task) {
    if (!(task instanceof Task)) { return; }
    const item = document.createElement('button');
    item.title = 'Click here to view more details for ' + task.toString();
    task.isCancelled() && item.setAttribute('class', 'cancel');
    task.isCompleted() && item.setAttribute('class', 'complete');
    task.isIncomplete() && item.setAttribute('class', 'incomplete');
    item.textContent = task.toString();
    item.onclick = () => show(task);
    return item;
}

/**
 * Regenerate the to-do task list.
 */
function refresh() {
    removeAllChildren(el('todo'));
    TodoList.forEach(task => el('todo').appendChild(getLineItem(task)), showIncomplete(), showCompleted(), showCancelled(), startDate(), endDate());
}

/**
 * Show a form ready to accept data for a new to-do task item.
 */
function showNewForm() {
    show(undefined);
}

/**
 * Show the form with customized controls that are shown and enabled. Show the details of a to-do task item.
 */
function show(newTask) {
    if (newTask instanceof Task || typeof newTask === 'undefined') {
        currentTask = newTask;
    } else {
        throw new Error('Expected parameter types: Task, undefined. Found ' + typeof newTask);
    }
    const isSelected = currentTask instanceof Task,
        hasParent = currentTask instanceof Task && currentTask.hasParent(),
        isIncomplete = currentTask instanceof Task && currentTask.isIncomplete(),
        isCompleted = currentTask instanceof Task && currentTask.isCompleted(),
        isCancelled = currentTask instanceof Task && currentTask.isCancelled();
    el('form').hidden = false;
    el('name').textContent = (currentTask instanceof Task) ? currentTask.toString() : '';
    el('name').hidden = !isSelected;
    el('date').textContent = (currentTask instanceof Task) ? currentTask.getTimeRange() : '';
    el('date').hidden = !isSelected;
    el('pare').hidden = !hasParent;
    el('desc').value = (currentTask instanceof Task) ? currentTask.desc : '';
    el('desc').readOnly = !(!isSelected || isIncomplete);
    el('pids').hidden = isSelected;
    el('updt').hidden = !isIncomplete;
    el('updt').disabled = true;
    el('cncl').hidden = !isIncomplete;
    el('cncl').disabled = !isIncomplete;
    el('cmpl').hidden = !isIncomplete;
    el('cmpl').disabled = !isIncomplete;
    el('incm').hidden = !isCompleted;
    el('incm').disabled = !isCompleted;
    el('reas').hidden = !isCancelled;
    el('reas').disabled = !isCancelled;
    el('assn').hidden = isSelected;
    el('assn').disabled = true;
    isSelected || setParentIDs();
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
    defaultOption.textContent = 'No Parent';
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
            option.textContent = task.toString();
            option.value = task.id;
            el('pids').appendChild(option);
        }
    }, true, false, false);
}
