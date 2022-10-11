/**
 * Represents a single line item in the to-do list.
 */
export class Task {
    /**
     * Create a new task based on user-defined parameters.
     */
    constructor(id = 0, parentId = 0, description = '', start = Task.#getTimestamp(), end = '') {
        this.id = id;
        this.pid = parentId;
        this.desc = description;
        this.start = start;
        this.end = end;
    }

    /**
     * Determine if this task is completed or not.
     */
    isComplete() {
        return !!this.end;
    }

    /**
     * Determine if this task is a child task.
     */
    hasParent() {
        return this.pid !== 0;
    }

    /**
     * Mark this task item as complete.
     */
    complete() {
        if (!this.isComplete()) {
            this.end = Task.#getTimestamp();
        } else {
            throw new Error('This task (' + this.id + ') is already completed.');
        }
    }

    /**
     * Mark this task item as cancelled.
     */
    cancel() {
        if (!this.isComplete()) {
            this.end = 'Cancelled ' + Task.#getTimestamp();
        } else {
            throw new Error('This task (' + this.id + ') is already completed.');
        }
    }

    /**
     * Return a brief string representation of this task item.
     */
    toString() {
        return '[' + this.id + '] ' + (this.desc.length > 10 ? this.desc.substring(0, 7) + '...' : this.description);
    }

    /**
     * Generate a new task from raw data.
     */
    static fromRaw(raw = {}) {
        if (typeof raw['id'] === 'number' && typeof raw['pid'] === 'number' && typeof raw['desc'] === 'string' && typeof raw['start'] === 'string' && typeof raw['end'] === 'string') {
            return new Task(raw['id'], raw['pid'], raw['desc'], raw['start'], raw['end']);
        } else {
            throw new Error('Incorrect fields or field types in raw data.');
        }
    }

    /**
     * Return the current local timestamp.
     */
    static #getTimestamp() {
        return new Date().toLocaleString();
    }
}
