const cssnano = require('cssnano')({
  preset: 'default',
});

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-preset-env'),
    ...(process.env.NODE_ENV === 'production' ? [cssnano] : []),
  ],
};
