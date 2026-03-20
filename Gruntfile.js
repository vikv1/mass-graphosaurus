module.exports = function (grunt) {
    "use strict";

    var SRC_FILES = "src/**/*.js";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            all: ["Gruntfile.js", SRC_FILES],
            options: {
                browser: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                globals: {
                    define: true,
                    module: true,
                    require: true,
                    THREE: true,
                },
                indent: 4,
                noarg: true,
                strict: true,
                trailing: true,
                undef: true,
                unused: true,
            }
        },
        browserify: {
            graphosaurus: {
                src: ["src/**/*.js"],
                dest: "dist/graphosaurus.js",
            }
        },
        uglify: {
            dist: {
                files: {
                    "dist/graphosaurus.min.js": "dist/graphosaurus.js"
                }
            }
        },
        watch: {
            files: ["Gruntfile.js", SRC_FILES],
            tasks: "default",
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-browserify");

    grunt.registerTask("default", ["compile"]);
    grunt.registerTask("compile", ["jshint", "browserify", "uglify"]);
};
