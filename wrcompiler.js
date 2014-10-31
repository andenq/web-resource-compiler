/**
 * Main binary file for web-resource-complier
 * @param	{string} path to configuration file.
 * @return	{string} results.
 */
(function() {
	if (process.argv.length < 3) {
		console.log("Missing argument: Path to configuration file.");
		return;
	}

	var exec 		= require('child_process').exec,
		fs 			= require('fs'),
		minify		= require('minify'),
		deferred	= require('deferred'),
		readFile 	= deferred.promisify(fs.readFile),
		args		= process.argv.slice(2),
		config 		= JSON.parse(fs.readFileSync(args[0], 'utf8'));

	var main = function () {
		console.log('Compiling using configuration: "' + args[0] + '"');

		for (var group_name in config) {
			console.log("Compiling group: " + group_name);
			var group = config[group_name];

			//Try to remove previous compiled resource
			try { fs.unlinkSync(group_name); } catch (ex) {
				if (ex.errno != 34) {
					console.log("Couldn't delete compilation target: " + ex.message);
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
					console.log("An error occurred: ");
					console.log(error);
				}
			);
		}
	};

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

	main();
})();