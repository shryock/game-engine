/**
 * Game engine module for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * The UIComponents module is a collection of useful, generic UI components
 * that the engine programmer can add to the game.
 *
 * This module utilizes the Singleton design pattern so that any game that utilizes
 * this module, does not have to register the changes with the engine; the engine
 * will automatically draw anything registered by the game.
 */
var UIComponents = (function() {
    var instance;

    // Anything within the init function is private to this module
    function init() {
        // pass in undefined for fillColor for an unfilled rectangle
        function Box(x, y, width, height, borderColor, fillColor) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.borderColor = borderColor;
            this.fillColor = fillColor;

            this.fill = function() {
                if (this.fillColor !== undefined) {
                    context.fillStyle = this.fillColor;
                    context.fillRect(this.x, this.y, this.width, this.height)
                }
            };

            this.draw = function() {
                this.fill();
                context.strokeStyle = this.borderColor;
                context.strokeRect(this.x, this.y, this.width, this.height);
            };
        };

        function Alert(x, y, text, style) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.style = style;

            this.draw = function() {
                context.font = this.style;
                context.fillText(this.text, this.x, this.y);
            };

            this.clear = function() {
                context.fillStyle = "white";
                context.fillRect(this.x, this.y, canvas.width, canvas.height);
            };
        };

        function Score(x, y, value) {
            this.x = x;
            this.y = y;

            this.value = value;

            this.getScore = function() {
                return value;
            };

            this.setScore = function(value) {
                this.value = value;
            };

            this.draw = function() {
                var context = getContext();
                var score_text = "Score: " + this.value;
                context.font = "30px Verdana";
                context.fillText(score_text, this.x, this.y);
            };
        };

        // id is the key value reference to pass to the storage module
        function HighScore(x, y, id) {
            this.x = x;
            this.y = y;
            this.id = id;

            var storage = new Storage();

            this.getScore = function() {
                var score = storage.getItem(this.id);
                if (score == null) {
                    this.value = 0;
                } else {
                    this.value = score;
                }

                return this.value;
            };

            this.setScore = function(value) {
                this.value = value;
                storage.setItem(this.id, this.value);
            };

            this.draw = function() {
                var context = getContext();
                var high_score_text = "High Score: " + this.value;
                context.font = "30px Verdana";
                context.fillText(high_score_text, this.x, this.y);
            };
        };

        // Anything in the return statement below is public
        return {
            uiComponents: [],

            addBox: function(x, y, width, height, borderColor, fillColor) {
                return this.addUIComponent(new Box(x, y, width, height, borderColor, fillColor));
            },

            addAlert: function(x, y, text, style) {
                return this.addUIComponent(new Alert(x, y, text, style));
            },

            addScore: function(x, y, value) {
                if (this.getScore() == null) {
                    return this.addUIComponent(new Score(x, y, value));
                }
            },

            addHighScore: function(x, y, id) {
                if (this.getHighScore() == null) {
                    return this.addUIComponent(new HighScore(x, y, id));
                }
            },

            getScore: function() {
                if (this.getScoreComponent() === null) {
                    return null;
                } else {
                    return this.getScoreComponent().getScore();
                }
            },

            setScore: function(value) {
                this.getScoreComponent().setScore(value);
            },

            getHighScore: function() {
                if (this.getHighScoreComponent() == null) {
                    return null;
                } else {
                    return this.getHighScoreComponent().getScore();
                }
            },

            setHighScore: function(value) {
                this.getHighScoreComponent().setScore(value);
            },

            getScoreComponent: function() {
                for (let component of this.uiComponents) {
                    if (component instanceof Score) {
                        return component;
                    }
                }
                return null;
            },

            getHighScoreComponent: function() {
                for (let component of this.uiComponents) {
                    if (component instanceof HighScore) {
                        return component;
                    }
                }

                return null;
            },

            // this really should be private; use the above "add" functions instead
            addUIComponent: function(component) {
                this.uiComponents[this.uiComponents.length] = component;
                return component;
            },

            removeUIComponent: function(component) {
                var index = this.uiComponents.indexOf(component);
                if (index !== -1) {
                    this.uiComponents[index].clear();
                    this.uiComponents[index] = null;
                }
            },

            draw: function() {
                for (var component of this.uiComponents) {
                    if (component !== null) {
                        component.draw();
                    }
                }
            }
        };
    };

    return {
        getInstance: function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();