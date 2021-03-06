var _ = require('underscore');
var request = require('request');

function PHLGeocode(opts) {
  this.defaultSettings = {
    geoHost: 'http://services.phila.gov',
    locationPath: '/ULRS311/Data/Location/',
    minConfidence: 85,
    responseBody: '' 
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

PHLGeocode.prototype.getCoordinates = function (address, callback) {
  var url = this.settings.geoHost + this.settings.locationPath + encodeURI(address);
  this.getData(url, callback);
};

PHLGeocode.prototype.getData = function (url, callback) {
  var self = this;
  var result;

  request(url, function (error, response, body) {
    self.settings.responseBody = body;
    result = self.parseLocations(JSON.parse(self.settings.responseBody).Locations);
    callback(result);
  });
};

PHLGeocode.prototype.parseLocations = function (locs) {
  var self = this;
  var locations = [];
  var locLength = locs.length;
  var loc;
  var i;
  var geometry;
  
  for (i=0; i<locLength; i++) {
    loc = locs[i];
    
    if (loc.Address.Similarity >= self.settings.minConfidence) {
      geometry = {
        address: loc.Address.StandardizedAddress,
        similarity: loc.Address.Similarity,
        latitude: loc.YCoord,
        longitude: loc.XCoord
      };
      
      locations.push(geometry);
    }
  }
  
  return locations;
};

module.exports = function(opts) {
  return new PHLGeocode(opts);
};
