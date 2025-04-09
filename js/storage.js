const Storage = {
    keys: {
        STATE: 'timeManagementState',
        THEME: 'timeManagementTheme',
        TASKS: 'timeManagementTasks',
        POMODORO: 'timeManagementPomodoro',
        FOCUS: 'timeManagementFocus'
    },

    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    },

    load: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    },

    saveState: function(state) {
        return this.save(this.keys.STATE, state);
    },

    loadState: function() {
        return this.load(this.keys.STATE);
    },

    clear: function() {
        try {
            Object.values(this.keys).forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },

    export: function() {
        const data = {};
        Object.values(this.keys).forEach(key => {
            data[key] = this.load(key);
        });
        return data;
    },

    import: function(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                this.save(key, value);
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};