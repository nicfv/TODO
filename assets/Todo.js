import { Task } from './Task.js';

/**
 * Represents the entire to-do task list.
 */
export class TodoList {
    static #list = [new Task()];
    static #maxId = 0;

    /**
     * Initialize the task list from raw data.
     */
    static load(raw = [], callback = () => { }) {
        TodoList.#list = [];
        for (let i in raw) {
            TodoList.#list.push(Task.fromRaw(raw[i]));
        }
        TodoList.#list.sort((a, b) => a.id > b.id);
        TodoList.#maxId = TodoList.#list[TodoList.#list.length - 1].id;
        callback();
    }

    /**
     * Return the JSON data for file saving.
     */
    static getJSON() {
        return JSON.stringify(TodoList.#list, null, 2);
    }

    /**
     * Add a new task item and return its ID number.
     */
    static newTask(description = '', parentId = 0) {
        TodoList.#list.push(new Task(++TodoList.#maxId, parentId, description));
        return TodoList.#maxId;
    }

    /**
     * Find the task with the specified ID, if one exists.
     */
    static findTask(id = 0) {
        return TodoList.#list.find(task => task.id === id);
    }

    /**
     * Return all children of the specified task.
     */
    static findChildren(id = 0) {
        return TodoList.#list.filter(task => task.pid === id);
    }

    /**
     * Return the parent task of this task.
     */
    static findParent(id = 0) {
        const self = TodoList.findTask(id);
        return (self && self.hasParent()) ? TodoList.findTask(self.pid) : undefined;
    }

    /**
     * Find related siblings of this task.
     */
    static findSiblings(id = 0) {
        const self = TodoList.findTask(id);
        return self.hasParent() ? TodoList.#list.filter(task => task.pid === self.pid && task.id !== self.id) : [];
    }

    /**
     * Call the callback function on all tasks in the to-do list, after applying filters.
     */
    static forEach(callback = () => { }, showIncomplete = true, showComplete = true, showCancelled = true, startTimestamp = 0, endTimestamp = 0) {
        TodoList.#list.filter(task => task.id > 0)
            .filter(task => (showIncomplete && task.isIncomplete()) || (showComplete && task.isCompleted()) || (showCancelled && task.isCancelled()))
            .filter(task => !startTimestamp || task.start >= startTimestamp)
            .filter(task => !endTimestamp || task.start <= endTimestamp)
            .forEach(task => callback(task));
    }
}
