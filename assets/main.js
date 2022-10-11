import { Task } from './Task.js';
import { TodoList } from './Todo.js';

window.onload = () => {
    const BTN_SAVE = document.getElementById('save'),
        BTN_LOAD = document.getElementById('load'),
        DIV_TODO = document.getElementById('todo'),
        DIV_SHOW = document.getElementById('show'),
        DIV_NEW = document.getElementById('new'),
        BTN_SHOW_CLOSE = document.getElementById('showClose'),
        BTN_NEW_CLOSE = document.getElementById('newClose'),
        isFiltering = () => !!document.getElementById('filter').checked,
        showName = name => document.getElementById('showName').innerText = name,
        showDesc = desc => document.getElementById('showDesc').innerText = desc;
    BTN_SAVE.onclick = () => {
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
    };
    BTN_LOAD.onclick = () => {
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
                reader.readAsText(BTN_LOAD.files[0]);
                reader.onload = () => TodoList.load(JSON.parse(reader.result), refresh);
            };
        }
    };
    function addLineItem(task) {
        if (!(task instanceof Task)) { return; }
        const item = document.createElement('div');
        if (task.isComplete()) {
            const strikethrough = document.createElement('s');
            strikethrough.innerText = task.toString();
        } else {
            item.innerText = task.toString();
        }
        item.onclick = () => show(task.id);
        DIV_TODO.appendChild(item);
    }
    function refresh() {
        DIV_TODO.innerText = '';
        if (isFiltering()) {
            TodoList.forEachIncomplete(task => addLineItem(task));
        } else {
            TodoList.forEach(task => addLineItem(task));
        }
    }
    function show(id = 0) {
        showName(TodoList.findTask(id).toString());
        showDesc(TodoList.findTask(id).desc);
    }
}
