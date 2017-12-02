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

        function Score(x, y, id, value, color) {
            this.x = x;
            this.y = y;
            this.id = id;
            this.color = color;

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
                context.fillStyle = color;
                context.font = "30px Verdana";
                context.fillText(score_text, this.x, this.y);
            };
        };

        // id is the key value reference to pass to the storage module
        function HighScore(x, y, id, color) {
            this.x = x;
            this.y = y;
            this.id = id;
            this.color = color;

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
                context.fillStyle = color;
                context.font = "30px Verdana";
                context.fillText(high_score_text, this.x, this.y);
            };
        };

        function Level(x, y, id, value, color) {
            this.x = x;
            this.y = y;
            this.id = id;
            this.color = color;

            this.value = value;

            this.getLevevl = function() {
                return value;
            };

            this.setLevel = function(value) {
                this.value = value;
            };

            this.draw = function() {
                var context = getContext();
                var score_text = "Level: " + this.value;
                context.fillStyle = color;
                context.font = "30px Verdana";
                context.fillText(score_text, this.x, this.y);
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

            addScore: function(x, y, id, value, color) {
                if (this.getScore(id) == null) {
                    return this.addUIComponent(new Score(x, y, id, value, color));
                }
            },

            addHighScore: function(x, y, id, color) {
                if (this.getHighScore(id) == null) {
                    return this.addUIComponent(new HighScore(x, y, id, color));
                }
            },

            addLevel: function(x, y, id, value, color) {
                if (this.getLevel(id) == null) {
                    return this.addUIComponent(new Level(x, y, id, value, color));
                }
            },

            getScore: function(id) {
                if (this.getScoreComponent(id) === null) {
                    return null;
                } else {
                    return this.getScoreComponent(id).getScore();
                }
            },

            setScore: function(id, value) {
                this.getScoreComponent(id).setScore(value);
            },

            getHighScore: function(id) {
                if (this.getHighScoreComponent(id) == null) {
                    return null;
                } else {
                    return this.getHighScoreComponent(id).getScore();
                }
            },

            setHighScore: function(id, value) {
                this.getHighScoreComponent(id).setScore(value);
            },

            getLevel: function(id) {
                if (this.getLevelComponent(id) === null) {
                    return null;
                } else {
                    return this.getLevelComponent(id).getLevel();
                }
            },

            setLevel: function(id, value) {
                this.getLevelComponent(id).setLevel(value);
            },

            getScoreComponent: function(id) {
                for (let component of this.uiComponents) {
                    if (component instanceof Score && component.id === id) {
                        return component;
                    }
                }
                return null;
            },

            getHighScoreComponent: function(id) {
                for (let component of this.uiComponents) {
                    if (component instanceof HighScore && component.id === id) {
                        return component;
                    }
                }

                return null;
            },

            getLevelComponent: function(id) {
                for (let component of this.uiComponents) {
                    if (component instanceof Level && component.id === id) {
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
            },

            clearUIComponents: function() {
                this.uiComponents = [];
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
