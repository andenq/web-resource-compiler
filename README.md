Web-resource-compiler
=====================
Tool for automatically compiling all your CSS and JS files using an easy to setup configuration file.

Configuration Example
---------------------
wrcompiler-config.json:

```json
{
	"./resources/css/compiled.css": [
		{
			"name": "./resources/css/src/bootstrap.min.css",
			"options": ["concatonly"]
		},
		"./resources/css/src/home-stylesheet.css"
	],
	"./resources/js/compiled.js": [
		{
			"name": "./resources/js/src/jquery.min.js",
			"options": ["concatonly"]
		},
		"./resources/js/src/webapp.js"
	]
}
```

####Run
`wrcompiler wrcompiler-config.json`

###Result
Previous example results in two files being created: `./resources/css/compiled.css` and `./resources/js/compiled.js`. They will both contain a combination of two other files. In order, one as-is and the other one minified (uglified).