module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        builddir: '.',
        banner: '/*!\n' +
            ' * <%= pkg.name %> v<%= pkg.version %>\n' +
            ' * Homepage: <%= pkg.homepage %>\n' +
            ' * Copyright 2012-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * Licensed under <%= pkg.license %>\n' +
            ' * Based on Bootstrap\n' +
            '*/\n',

        clean: {
            build: {
                src: ['*/build.less', '!global/build.less']
            }
        },

        concat: {
            slgrid: {
              files: [{
                    src: [
                        "SLGrid/SLGrid.js",
                        "SLGrid/SLBindingHandlers.js",
                        "SLGrid/SLGridViewModel.js",
                        "SLGrid/SLEntity.js",
                        //"SLGrid/SLGrid.js",
                        "SLGrid/DBEntity.js"], 
                    dest: 'SLGridALL.js'
                }]
            },
            app: {
              files: [{
                src: [
                        "App/City/CityDB.js",
                        "App/City/City.js",
                        "App/City/DropDownCity.js",
                        "App/City/TypeaheadCity.js",
                        "App/City/CityList.js",

                        "App/Person/PersonDB.js",
                        "App/Person/Person.js",
                        "App/Person/PersonListFilter.js",
                        "App/Person/PersonList.js"
                ],
                dest: 'MyAppALL.js', nonull: true
              }]
            },
            gen: {
              files: [{
                  src: [
                        "Gen/Entity.js",
                        "Gen/DropDownDataType.js",
                        "Gen/DropDownPresentation.js",
                        "Gen/EntityField/EntityField.js",
                        "Gen/EntityField/EntityFieldDB.js",
                        "Gen/EntityField/EntityFieldList.js"
                ],
                  dest: 'GenALL.js', nonull: true
              }]
            }
        },
        less: {
            dist: {
                options: {
                    compress: false
                },
                files: {}
            }
        }
    });

    grunt.registerTask('none', function () { });

    grunt.registerTask('build', 'build a regular theme', function (theme, compress) {
        var compress = compress == undefined ? true : compress;

        var concatSrc;
        var concatDest;
        var lessDest;
        var lessSrc;
        var files = {};
        var dist = {};
        concatSrc = 'global/build.less';
        concatDest = theme + '/build.less';
        lessDest = '<%=builddir%>/' + theme + '/bootstrap.css';
        lessSrc = [theme + '/' + 'build.less'];

        dist = { src: concatSrc, dest: concatDest };
        grunt.config('concat.dist', dist);
        files = {}; files[lessDest] = lessSrc;
        grunt.config('less.dist.files', files);
        grunt.config('less.dist.options.compress', false);

        grunt.task.run(['concat', 'less:dist', 'clean:build',
      compress ? 'compress:' + lessDest + ':' + '<%=builddir%>/' + theme + '/bootstrap.min.css' : 'none']);
    });

    grunt.registerTask('compress', 'compress a generic css', function (fileSrc, fileDst) {
        var files = {}; files[fileDst] = fileSrc;
        grunt.log.writeln('compressing file ' + fileSrc);

        grunt.config('less.dist.files', files);
        grunt.config('less.dist.options.compress', true);
        grunt.task.run(['less:dist']);
    });

};
