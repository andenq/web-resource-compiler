/**
 * Main module for web-resource-complier
 * @param	{string} path to configuration file.
 * @return	{string} results.
 */
(function() {
	if (process.argv.length < 3) {
		console.log("Missing argument: Path to configuration file.");
		return;
	}

	var fs 			= require('fs'),
		minify		= require('minify'),
		deferred	= require('deferred'),
		readFile 	= deferred.promisify(fs.readFile),
		LOG 		= false;

	var main = function (config, _log) {
		LOG = _log;

		for (var group_name in config) {
			handleGroup(group_name, config[group_name]);
		}
	};

	var handleGroup = function (group_name, group) {
		log("Compiling group: " + group_name);

		//Try to remove previous compiled resource
		try { fs.unlinkSync(group_name); } catch (ex) {
			if (ex.errno != 34) {
				log("Couldn't delete compilation target: " + ex.message);
			}
		}

		var writer = fs.createWriteStream(group_name);

		deferred.map(group, function (file) {
			var name = "";
			var concatonly = false;

			if (typeof file == "string") {
				name = file;
			} else if (typeof file == "object") {
				name = file.name;
				concatonly = file.options.indexOf('concatonly') >= 0;
			}

			if (concatonly) {
				return concatFile(name, writer);
			} else {
				return minifyFile(name, writer);
			}
		}).done(
			function(data) {
				writer.end();
			},
			function (error) {
				log("An error occurred: ");
				log(error);
			}
		);
	}

	var concatFile = function (file, writer) {
		var def = deferred();

		readFile(file, 'utf-8').done(
			function(data) {
				writer.write(data);
				def.resolve();
			},
			function (error) {
				def.reject(error);
			}
		);

		return def.promise;
	};

	var minifyFile = function (file, writer) {
		var def = deferred();

		minify(file, function(error, data) {
			if (!error) {
				writer.write(data);
				def.resolve();
			} else {
				def.reject(error);
			}
		});

		return def.promise;
	};

	var log = function (obj) {
		if (LOG) console.log(obj);
	}

	module.exports.compile = function (config, _log) {
		return main(config, _log);
	};

})();