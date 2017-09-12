var Assets = function ()  {
	
	var sprites = [];
	
	function Sprite(x, y, width, height, src) {
		this.X = x;
		this.Y = y;
		this.origX = x;
		this.origY = y;
		this.image = new Image();
		this.image.width = width;
		this.image.height = height;
		this.image.src = src;
	}
	
	var assetPrototype = {"Sprite" : Sprite};
	var assetList = {"Sprite" : sprites};

	return {
		/**
		 * Add a new sprite the list of sprites in assets
		 */
		addSprite: function (x, y, width, height, src) {
			assetList["Sprite"].push(new assetPrototype["Sprite"](x, y, width, height, src));
			return sprites.length - 1;
		},
		
		/**
		 * Create a new asset type tht can be used in project
		 */
		newAsset: function (name, obj) {
			assetPrototype[name] = obj;
			assetList[name] = [];
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