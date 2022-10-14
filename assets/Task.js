/**
 * Represents a single line item in the to-do list.
 */
export class Task {
    /**
     * Create a new task based on user-defined parameters.
     */
    constructor(id = 0, parentId = 0, description = '', start = Date.now(), end = 0) {
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
        return this.end !== 0;
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
            this.end = Date.now();
        } else {
            throw new Error('This task (' + this.id + ') is already completed.');
        }
    }

    /**
     * Return human-readable start and end dates for this task.
     */
    getTimeRange() {
        return 'Assigned on ' + new Date(this.start).toLocaleString() + '. ' + (this.isComplete() ? 'Completed on ' + new Date(this.end).toLocaleString() : 'In progress') + '.';
    }

    /**
     * Return a brief string representation of this task item.
     */
    toString() {
        const maxLength = 30,
            lines = this.desc.trim().split('\n').filter(x => x);
        return '[' + this.id + '] ' + (this.desc.length > maxLength || lines.length > 1 ? lines[0].trim().substring(0, maxLength - 3).trim() + '...' : lines[0].trim());
    }

    /**
     * Generate a new task from raw data.
     */
    static fromRaw(raw = {}) {
        if (typeof raw['id'] === 'number' && typeof raw['pid'] === 'number' && typeof raw['desc'] === 'string' && typeof raw['start'] === 'number' && typeof raw['end'] === 'number') {
            return new Task(raw['id'], raw['pid'], raw['desc'], raw['start'], raw['end']);
        } else {
            throw new Error('Incorrect fields or field types in raw data.');
        }
    }
}
