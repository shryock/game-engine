/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * ParticleSystem object.
 */
function ParticleSystem(particleName, spriteSrc, baseWidth, baseHeight, minX, maxX, minY, maxY, minDir, maxDir, minSize, maxSize, minSp, maxSp, timeout) {
    this.prototype = Object.create(GameObject.prototype);
    GameObject.call(this);

    var _this = this;

    this.name = "particle-system";
    this.particleName = particleName;
    this.spriteSrc = spriteSrc;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
    this.minDir = minDir;
    this.maxDir = maxDir;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.minSp = minSp;
    this.maxSp = maxSp;
    this.timeout = timeout;
    this.particles = [];
    this.numberOfParticles = 0;
    this.interval;

    function Particle(name, spriteSrc, baseWidth, baseHeight, id, x, y, dir, size, speed) {
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);

        this.sprite = addSprite(x, y, size*baseWidth, size*baseHeight, spriteSrc);
        this.name = name + id;
        this.sprite.X = x;
        this.sprite.Y = y;
        this.dir = dir;
        this.size = size;
        this.speed = speed;

        this.setVisibility(true);
    }

    this.draw = function() {
        for (var particle of this.particles) {
            particle.draw();
        }
    }

    this.generateParticle = function() {
        var x = Math.round(Math.random()*(this.maxX - this.minX) + this.minX);
        var y = Math.round(Math.random()*(this.maxY - this.minY) + this.minY);
        var dir = Math.round(Math.random()*(this.maxDir - this.minDir) + this.minDir);
        var size = Math.round(Math.random()*(this.maxSize - this.minSize) + this.minSize);
        var speed = Math.round(Math.random()*(this.maxSp - this.minSp) + this.minSp);

        var particle = new Particle(this.particleName, this.spriteSrc, this.baseWidth, this.baseHeight, this.numberOfParticles++, x, y, dir, size, speed);
        this.particles.push(particle);
        addCreatedGameObject(particle);

        // Set timer to destroy particle
        if (this.timeout !== undefined) {
          setTimeout(function() {
                _this.destroyParticle(particle.name);
            }, this.timeout);
        }
    }

    this.destroyParticle = function(particleName) {
      for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i].name === particleName) {
            this.particles.splice(i, 1);
        }
      }

      removeGameObject(particleName);
    }

    this.generateParticlesAtRate = function(rate) {
        this.interval = setInterval(function() {
            _this.generateParticle();
        }, rate);
    }

    this.stopParticleGeneration = function() {
        clearInterval(this.interval);
    }

    this.generateFiniteNumParticles = function(numberOfParticles, rate) {
        _this.generateParticle();
        setTimer(function() {
            _this.generateParticle();
        }, rate, numberOfParticles - 1);
    }

    this.getNumberParticles = function() {
        return this.particles.length;
    }
}
