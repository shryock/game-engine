var Assets = function ()  {
	
	var sprites = [];
	
	function Sprite(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY) {
		this.X = x;
		this.Y = y;
		this.origX = x;
		this.origY = y;
		this.width = width;
		this.height = height;
		this.frameIndex = 0;
		this.frames = frames;
		this.image = new Image();
		if (tileWidth > 0 && tileHeight > 0) {
			this.tileWidth = tileWidth;
			this.tileHeight = tileHeight;
		} else {
			this.tileWidth = srcWidth;
			this.tileHeight = srcHeight;
		}
		this.image.width = srcWidth;
		this.image.height = srcHeight;
		this.image.src = src;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		
		this.nextFrame = function () {
			this.frameIndex = (this.frameIndex + 1) % this.frames;
			
		};
		
		this.draw = function(canvas) {
			if (tileWidth > 0 && tileHeight > 0) {
				canvas.drawImage(this.image, this.offsetX + this.frameIndex * this.tileWidth, this.offsetY, this.tileWidth, this.tileHeight, this.X, this.Y, this.width, this.height);
			} else {
				canvas.drawImage(this.image, this.X, this.Y, this.width, this.height );
			}
		};
		
	}
	
	var assetPrototype = {"Sprite" : Sprite};
	var assetList = {"Sprite" : sprites};

	return {
		/**
		 * Add a new sprite the list of sprites in assets
		 */
		addSpriteFromSheet: function (x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY) {
			assetList["Sprite"].push(new assetPrototype["Sprite"](x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY));
			return assetList["Sprite"][assetList["Sprite"].length - 1];
		},
		
		addSprite: function (x, y, width, height, src) {
			assetList["Sprite"].push(new assetPrototype["Sprite"](x, y, width, height, 1, src, 0, 0, width, height, 0, 0, 0, 0));
			return assetList["Sprite"][assetList["Sprite"].length - 1];
		},
		
		updateSprites: function() {
			for (var i = 0; i < assetList["Sprite"].length; i++) {
				spr = assetList["Sprite"][i].nextFrame();
			}
		},
		
		/**
		 * Create a new asset type tht can be used in project
		 */
		newAsset: function (name, obj) {
			assetPrototype[name] = obj;
			assetList[name] = [];
			return obj;
		},
		
		createAsset: function (name) {
			return (assetPrototype[name])
		},
		
		addAsset: function (name, object) {
			assetList[name].push(object);
			return object;
		},
		
		getAsset: function (name, index) {
			return assetList[name][index];
		},
		
		getAssetByFunction: function (name, func) {
			for (var i = 0; i < assetList[name].length; i++ ) {
				if (func(assetList[name][i])) {
					return assetList[name][i];
				}
			}
			return null;
		},
		
		getList: function (name) {
			return assetList[name];
		},
		
		forEach: function (name, func) {
			for (var i = 0; i < assetList[name].length; i++ ) {
				func(assetList[name][i]);
			}
		}
	}

};