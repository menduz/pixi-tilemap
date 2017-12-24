function requireRpgMaker() {

  function LevelLoader() {
    this.initialize.apply(this, arguments);
  }

  LevelLoader.prototype = {
    initialize: function () {

    },
    load: function (name, cb) {
      var tilesets = null;
      var tileset = null;
      var tilesetNames = null;
      var map = null;
      var loader = new PIXI.loaders.Loader();
      var self = this;
      function progress(loader, resource) {
        if (resource.name == 'tilesets') {
          //1. load the map
          loader.add(name, 'rpgmaker/data/' + name + '.json', { parentResource: resource });
          self.tilesetResource = resource;
          tilesets = resource.data;
        } else
          if (resource.name == name) {
            //2. load spritesheets
            map = resource.data;
            tileset = tilesets[map['tilesetId']];
            tilesetNames = tileset['tilesetNames'];
            tilesetNames.forEach(function (name) {
              if (name.length > 0 && !PIXI.utils.TextureCache[name])
                loader.add(name, 'rpgmaker/img/' + name + ".png", { parentResource: resource });
            })
          }
      }
      loader.on('progress', progress);
      //0. load tilesets
      if (this.tilesetResource)
        progress(self.tilesetResource);
      else
        loader.add('tilesets', 'rpgmaker/data/Tilesets.json');
      loader.load(function (loader, resources) {
        var result = new RPGMap.Tilemap(300, 300);
        for (var i = 0; i < tilesetNames.length; i++) {
          var tex = resources[tilesetNames[i]] && resources[tilesetNames[i]].texture;
          result.bitmaps.push(tex);
          if (tex) tex.baseTexture.mipmap = true;
        }
        while (result.bitmaps.length > 0 && !result.bitmaps[result.bitmaps.length - 1]) {
          result.bitmaps.pop();
        }
        result.flags = tileset.flags;
        result.setData(map.width, map.height, map.data);
        result.refresh();
        cb(null, result);
      })
    }
  };

  return new LevelLoader();
};