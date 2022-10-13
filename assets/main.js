import { Task } from './Task.js';
import { TodoList } from './Todo.js';

window.onload = init;

let currentView = 0;

/**
 * General helper functions.
 */
const el = id => document.getElementById(id),
    isFiltering = () => !!el('filter').checked,
    startDate = () => new Date(el('start').value).getTime() || 0,
    endDate = () => new Date(el('end').value).getTime() || 0,
    setName = name => el('name').innerText = name,
    setDate = date => el('date').innerText = date,
    setDesc = desc => el('desc').innerText = desc,
    setPrnt = prnt => el('prnt').innerText = prnt,
    linkPrnt = prnt => el('prnt').href = prnt,
    getDesc = () => el('desc').innerText,
    showShow = show => el('show').hidden = !show,
    showPIDs = show => el('pids').hidden = !show,
    showUpdt = show => el('updt').hidden = !show,
    showComp = show => el('comp').hidden = !show,
    enableDesc = enabled => el('desc').readOnly = !enabled,
    enableUpdt = enabled => el('updt').disabled = !enabled,
    enableComp = enabled => el('comp').disabled = !enabled;

/**
 * Initialize event handlers.
 */
function init() {
    el('save').onclick = save;
    el('load').onclick = open;
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
    TodoList.forEach(!isFiltering(), startDate(), endDate(), task => el('todo').appendChild(getLineItem(task)));
}

/**
 * Show the details of a to-do task item.
 */
function show(id = 0) {
    currentView = id;
    if (id > 0) {
        const task = TodoList.findTask(id);
        if (task instanceof Task) {
            showShow(true);
            showComp(true);
            showPIDs(false);
            showUpdt(true);
            enableDesc(false);
            enableComp(false);
            enableUpdt(true);
            setName(task.toString());
            setDesc(task.desc);
            setDate(task.getTimeRange());
        } else {
            throw new Error('No task found with id ' + id + '.');
        }
    } else {
        showShow(false);
    }
}
