import { Task } from './Task.js';
import { TodoList } from './Todo.js';

window.onload = init;

let currentView = 0;

/**
 * General helper functions.
 */
const el = id => document.getElementById(id),
    showAll = () => !el('filter').checked,
    startDate = () => new Date(el('start').value).getTime() || 0,
    endDate = () => new Date(el('end').value).getTime() || 0,
    setName = name => el('name').innerText = name,
    setDate = date => el('date').innerText = date,
    setPare = pare => el('pare').innerText = pare,
    setDesc = desc => el('desc').innerText = desc,
    linkPare = pare => el('pare').href = pare,
    getDesc = () => el('desc').innerText,
    getPID = () => +el('pids').value,
    showShow = show => el('show').hidden = !show,
    showPIDs = show => el('pids').hidden = !show,
    showUpdt = show => el('updt').hidden = !show,
    showCmpl = show => el('cmpl').hidden = !show,
    showAssn = show => el('assn').hidden = !show,
    enableDesc = enabled => el('desc').readOnly = !enabled,
    enableUpdt = enabled => el('updt').disabled = !enabled,
    enableCmpl = enabled => el('cmpl').disabled = !enabled,
    enableAssn = enabled => el('assn').disabled = !enabled;

/**
 * Initialize event handlers.
 */
function init() {
    el('save').onclick = save;
    el('load').onclick = open;
    el('new').onclick = () => show(0);
    el('close').onclick = () => show(-1);
    el('desc').oninput = () => enableUpdt(true);
    el('updt').onclick = () => { enableDesc(true); enableUpdt(false); };
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
 * Create a line item for the current task.
 */
function getLineItem(task) {
    if (!(task instanceof Task)) { return; }
    const item = document.createElement('div');
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
    el('todo').innerText = '';
    TodoList.forEach(task => el('todo').appendChild(getLineItem(task)), showAll(), startDate(), endDate());
}

/**
 * Show the details of a to-do task item.
 */
function show(id = 0) {
    currentView = id;
    if (id > 0) {
        const task = TodoList.findTask(id);
        if (task instanceof Task) {
            showAssn(false);
            showCmpl(true);
            showPIDs(false);
            showShow(true);
            showUpdt(true);
            enableAssn(false);
            enableDesc(false);
            enableCmpl(false);
            enableUpdt(true);
            setName(task.toString());
            setDesc(task.desc);
            setDate(task.getTimeRange());
            clearParentIDs();
        } else {
            throw new Error('No task found with id ' + id + '.');
        }
    } else if (id < 0) {
        showShow(false);
    } else {
        showAssn(true);
        showCmpl(false);
        showPIDs(true);
        showShow(true);
        showUpdt(false);
        enableAssn(false);
        enableCmpl(false);
        enableDesc(true);
        enableUpdt(false);
        setParentIDs();
    }
}

/**
 * Clear all parent IDs from the dropdown menu.
 */
function clearParentIDs() {
    let child;
    while (child = el('pids').firstChild) {
        el('pids').removeChild(child);
    }
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
