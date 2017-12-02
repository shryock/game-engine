/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * Storage module. Provides simple functions for persistent storage of data.
 */
var Storage = function() {
    this.storage = window.localStorage;

    this.setItem = function(name, value) {
        this.storage.setItem(name, value);
    }

    this.getItem = function(name) {
        return this.storage.getItem(name);
    }

    this.removeItem = function(name) {
        this.storage.removeItem(name);
    }
}