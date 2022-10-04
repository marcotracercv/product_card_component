const { src, dest, watch, series, parallel } = require('gulp');
const plumber = require('gulp-plumber');//evita el termino de una ejecucion continua (watchSass) por algun error y muentra resumen del mismo
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss'); // herramienta de optimizacion (css, js, img, ect.. ) usando plugins
const sourcemaps = require('gulp-sourcemaps'); //archivo que conecta las versiones compiladas, minificadas o comprimidas de css/js con las escritas originalmente por el desarrollador
const autoprefixer = require('autoprefixer'); //crea optimizacion de css basadas en valores de  https://caniuse.com/ para crear css entendible en todos los buscadores (plugin de postcss)
const concat = require('gulp-concat'); //unifica los modulos js en 1 solo archivo en el orden especificado, EJEMPLO: bootstrap.js + select2.js + sweetalert.js -> bundle.js

const terser = require('gulp-terser');

const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const avif = require('gulp-avif');

const paths = {
    sass: 'resources/scss/**/*.scss',
    js: 'resources/js/**/*.js',
    images: 'resources/img/**/*'
};

const plugins = {
    plugins: [
        autoprefixer(),
    ]
};

function CompileSass() {
    return src(paths.sass)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([plugins]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('build/css/'))
}

function minImages() {
    return src(paths.images)
        .pipe(cache(imagemin({ optimizationLevel: 5 })))
        .pipe(dest('build/img/'))
}

function imgWebp() {
    return src(paths.images)
        .pipe(webp())
        .pipe(dest('build/img/'))
}

function imgAvif() {
    return src('resources/img/**/*.{png,jpg}')
        .pipe(avif())
        .pipe(dest('build/img/'))
}


function javascript() {
    return src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('build/js/'))
}

function watchChanges() {
    // revisa los cambios en el archivo especificado y ejecuta una tarea
    watch(paths.sass, CompileSass);
    watch(paths.images, minImages);
    watch(paths.images, imgWebp);
    watch(paths.images, imgAvif);
    watch(paths.js, javascript);
}




exports.watchChanges = watchChanges; // tareas publicas que se pueden llamar desde consola con 'gulp NOMBRE DE LA TAREA'

exports.default = series(CompileSass, minImages, imgWebp, imgAvif, javascript, watchChanges);
