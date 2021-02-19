var gulp = require("gulp");
var plugins = require("gulp-load-plugins")({
    overridePattern: false,
    pattern: [
        'del',
        'main-bower-files',
        'run-sequence',
        'webpack-stream',
    ]
});
var Karma = require('karma').Server;
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var offsetLines = require('offset-sourcemap-lines');
var conv = require('convert-source-map');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefixPlugin = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});
var fs = require('fs');
var path = require('path');

var env = process.env.CTC_ENV || "dev";
var entryJs = process.env.CTC_ENTRY_JS || "index-property.jsx";

plugins.help(gulp);

function isProduction() {
    return env !== 'dev';
}

gulp.task("clean", "Clean unnecessary files/directories", function () {
    return plugins.del(["build", "dist", "test"]);
});

gulp.task("build:less", "Build less files into css files", function () {
    return gulp.src(['src/common/**/*.less', 'src/apps/**/*.less'])
        .pipe(plugins.less())
        .pipe(plugins.concat('app.css'))
        .pipe(gulp.dest('build/css/'));
});

gulp.task("build:jslib", "Build javascript libraries", function () {
    return gulp.src(plugins.mainBowerFiles())
        .pipe(gulp.dest('build/lib/'));
});

gulp.task("build:lib", "Build javascript libraries", function () {
    return gulp.src(['src/lib/**/*'])
        .pipe(gulp.dest('build/lib/'));
});

gulp.task("build:js", "Build javascript files", function () {
    return gulp.src(['src/common/**/*.js', 'src/tools/env/' + env + '.js', '!src/common/**/*.spec.js', 'src/apps/**/*.js', '!src/apps/**/*.spec.js'])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.babel())
        .pipe(plugins.concat('app.js'))
        .pipe(plugins.sourcemaps.write("."))
        .pipe(gulp.dest('build/js/'));
});

/*
 * This is an ugly hack here, but there is no better way.
 * The trap is that when salesforce lightning loads the script from the static resource,
 * it will wrap our script with generated IIFE, which addes extra two lines in the concatenated
 * file.
 * To fix this, we add a "_.js" under "common" directory, which contains only one line
 * of comment. After babel transpiling, it perfectly adds extra two lines to the final file.
 * Then we run sourcemaps to create the correct tracking infomation. Before we do the release,
 * we run the fix below to remove the first two lines from the concatenated file.
 */
gulp.task("build:js-fix", "Fix lightning generated javascript issue", function () {
    return gulp.src(['build/js/app.js'])
        .pipe(plugins.removeLine({ "app.js": ["1-12"] }))
        .pipe(gulp.dest('build/js/'));
});

gulp.task("build:library", function() {
    return gulp.src("src/library/index.js")
        .pipe(plugins.webpackStream({
            output: {
                filename: "library.js",
            },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['env']
                            }
                        }
                    }
                ],
            },
            plugins: [
                new UglifyJsPlugin(),
            ]
        }))
        .pipe(gulp.dest("build/js"));
});

const buildPreact = (entryJs) => {
    if(isProduction()) {
        return gulp.src("src/preact/" + entryJs)
            .pipe(plugins.webpackStream({
                output: {
                    filename: "preact-app.js",
                },
                resolve: {
                    alias: {
                        components: path.resolve(__dirname, 'src/preact/components')
                    },
                    extensions: [".js", ".jsx"],
                },
                module: {
                    rules: [
                        {
                            test: /\.jsx?$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['env', 'preact']
                                }
                            }
                        },
                        {
                            test: /\.(css|less)$/,
                            use: ExtractTextPlugin.extract({
                                fallback: "style-loader",
                                use: [
                                    {
                                        loader: 'css-loader',
                                        query: {
                                            modules: true,
                                            localIdentName: '[name]__[local]___[hash:base64:5]'
                                        }
                                    },
                                    {
                                        loader: 'less-loader',
                                        options: {
                                            plugins: [ autoprefixPlugin ],
                                        },
                                    },
                                ],
                            })
                        }
                    ],
                },
                plugins: [
                    new ExtractTextPlugin("../css/preact-app.css"),
                    new UglifyJsPlugin(),
                ]
            }))
            .pipe(gulp.dest("build/js"));
    }
    else {
        return gulp.src("src/preact/" + entryJs)
            .pipe(plugins.webpackStream({
                output: {
                    filename: "preact-app.js",
                },
                resolve: {
                    alias: {
                        components: path.resolve(__dirname, 'src/preact/components')
                    },
                    extensions: [".js", ".jsx"],
                },
                module: {
                    rules: [
                        {
                            test: /\.jsx?$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['env', 'preact']
                                }
                            }
                        },
                        {
                            test: /\.(css|less)$/,
                            use: ExtractTextPlugin.extract({
                                fallback: "style-loader",
                                use: [
                                    {
                                        loader: 'css-loader',
                                        query: {
                                            modules: true,
                                            localIdentName: '[name]__[local]___[hash:base64:5]'
                                        }
                                    },
                                    {
                                        loader: 'less-loader',
                                        options: {
                                            plugins: [ autoprefixPlugin ],
                                        },
                                    },
                                ],
                            })
                        }
                    ],
                },
                devtool: 'source-map',
                plugins: [
                    new ExtractTextPlugin("../css/preact-app.css"),
                ]
            }))
            .pipe(gulp.dest("build/js"));
    }
};

gulp.task("build:preact", function() {
    return buildPreact(entryJs);
});

gulp.task("build:preact-predictions", function() {
    return buildPreact('index-predictions.jsx');
});

gulp.task("build:spec", "Build test files", function (){
    return gulp.src(['src/common/**/*.spec.js', 'src/apps/**/*.spec.js', 'src/tools/test/*.js'])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'))
        .pipe(plugins.babel())
        .pipe(gulp.dest('test/'));
});

gulp.task("build:static", "Copy static files", function () {
    return gulp.src(['src/static/**/*'])
        .pipe(gulp.dest('build/static/'));
});

gulp.task("build:html", "Copy html files", function () {
    return gulp.src(['src/public/**/*'])
        .pipe(gulp.dest('build/'));
});

gulp.task("test", function(done) {
    return new Karma({
        configFile: __dirname + "/karma.conf.js",
        singleRun: true
    }, function(code) {
        if (code === 1){
            console.log('Unit Test failures, exiting process');
            done('Unit Test Failures');
        } else {
            console.log('Unit Tests passed');
            done();
        }
    }).start();
});

gulp.task("package", "Package the static resource", function () {
    return gulp.src(['build/**/*', '!build/js/preact-app.js*', '!build/css/preact-app.css*'])
        .pipe(plugins.zip('ctcPropertyLightning.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task("package-app", "Package the static resource", function () {
    return gulp.src(['build/js/preact-app.js*', 'build/css/preact-app.css*'])
        .pipe(plugins.zip('ctcPropertyLightningApp.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task("package-app-predictions", "Package the static resource", function () {
    return gulp.src(['build/js/preact-app.js*', 'build/css/preact-app.css*'])
        .pipe(plugins.zip('ctcPropertyLightningApp_predictions.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task("default", "Run the default task", function () {
    return plugins.runSequence("clean", "build:less", "build:jslib", "build:js", "build:spec", "build:library", "build:lib", "build:preact",  "package-app", "build:static", "build:html", "package");
});
