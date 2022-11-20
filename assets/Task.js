/**
 * Represents a single line item in the to-do list.
 */
export class Task {
    /**
     * Create a new task based on user-defined parameters.
     */
    constructor(id = 0, parentId = Status.NO_PARENT, description = '', start = Date.now(), end = Status.INCOMPLETE) {
        this.id = id;
        this.pid = parentId;
        this.desc = description;
        this.start = start;
        this.end = end;
    }

    /**
     * Determine if this task is still incomplete.
     */
    isIncomplete() {
        return this.end === Status.INCOMPLETE;
    }

    /**
     * Determine if this task is cancelled or not.
     */
    isCancelled() {
        return this.end === Status.CANCELLED;
    }

    /**
     * Determine if this task is marked as completed and not cancelled.
     */
    isCompleted() {
        return !this.isIncomplete() && !this.isCancelled();
    }

    /**
     * Determine if this task is a child task.
     */
    hasParent() {
        return this.pid !== Status.NO_PARENT;
    }

    /**
     * Mark this task item as complete.
     */
    complete() {
        if (this.isIncomplete()) {
            this.end = Date.now();
        } else {
            throw new Error('This task (' + this.id + ') is already completed or cancelled.');
        }
    }

    /**
     * Cancel this task item.
     */
    cancel() {
        if (this.isIncomplete()) {
            this.end = Status.CANCELLED;
        } else {
            throw new Error('This task (' + this.id + ') is already completed or cancelled.');
        }
    }

    /**
     * Mark this task item as incomplete.
     */
    incomplete() {
        if (this.isCompleted()) {
            this.end = Status.INCOMPLETE;
        } else {
            throw new Error('This task (' + this.id + ') is not completed.');
        }
    }

    /**
     * Reassign a cancelled task.
     */
    reassign() {
        if (this.isCancelled()) {
            this.end = Status.INCOMPLETE;
            this.start = Date.now();
        } else {
            throw new Error('This task (' + this.id + ') is not cancelled.');
        }
    }

    /**
     * Return human-readable start and end dates for this task.
     */
    getTimeRange() {
        return 'Assigned on ' + new Date(this.start).toLocaleString() + '. ' + (this.isCancelled() ? 'Cancelled' : (this.isCompleted() ? 'Completed on ' + new Date(this.end).toLocaleString() + ' (' + this.#getTimeSpan() + ')' : 'In progress')) + '.';
    }

    /**
     * Calculate the time span in days and hours.
     */
    #getTimeSpan() {
        if (this.isCompleted()) {
            const hour = 1000 * 60 * 60,
                day = hour * 24,
                spanMS = this.end - this.start,
                days = Math.round(spanMS / day),
                hours = Math.round(spanMS / hour);
            if (spanMS >= day) {
                return days + ' day' + (days === 1 ? '' : 's');
            } else {
                return hours + ' hour' + (hours === 1 ? '' : 's');
            }
        }
    }

    /**
     * Return a brief string representation of this task item.
     */
    toString() {
        const maxLength = 30,
            firstLine = this.desc.trim().split('\n')[0].trim() || '(empty)';
        return '[' + this.id + '] ' + (firstLine.length > maxLength ? firstLine.substring(0, maxLength - 3) + '...' : firstLine);
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

/**
 * Represents an enum of Task statuses.
 */
const Status = {
    INCOMPLETE: 0,
    CANCELLED: -1,
    NO_PARENT: 0,
};