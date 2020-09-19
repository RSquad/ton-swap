const off = 'off';
const error = 'error';
const warn = 'warn';
const always = 'always';

const indent = 2;


module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
  ],
  plugins: [
  ],
  rules: {
    'arrow-body-style': off,
    'arrow-parens': [error, 'as-needed', {
      requireForBlockBody: true,
    }],
    'function-paren-newline': off,
    indent: [error, indent, {
      MemberExpression: 0,
    }],
    'jsx-a11y/href-no-hash': off,
    'jsx-a11y/anchor-is-valid': [warn, {
      aspects: ['invalidHref'],
    }],
    'keyword-spacing': error,
    'lines-between-class-members': [error, always, {
      exceptAfterSingleLine: true,
    }],
    'max-len': [error, {
      code: 78,
    }],
    // 'no-console': off,
    'object-curly-newline': off,
    'operator-linebreak': [error, 'before'],
    'react/jsx-filename-extension': [warn, {
      extensions: ['.js', '.jsx'],
    }],
    'react/jsx-indent-props': [warn, indent],
    'react/jsx-indent': [error, indent],
    // 'react/jsx-props-no-spreading': off,
    'react/static-property-placement': [error, 'static public field'],
    'template-curly-spacing': [error, always],
  },
  settings: {
    // flowtype: {
    //     onlyFilesWithFlowAnnotation: true,
    // }
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
};
