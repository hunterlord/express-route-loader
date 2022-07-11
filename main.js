function normalize(strArray) {
  const resultArray = [];
  if (strArray.length === 0) {
    return '';
  }

  if (typeof strArray[0] !== 'string') {
    throw new TypeError('Url must be a string. Received ' + strArray[0]);
  }

  // If the first part is a plain protocol, we combine it with the next part.
  if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
    strArray[0] = strArray.shift() + strArray[0];
  }

  // There must be two or three slashes in the file protocol, two slashes in anything else.
  if (strArray[0].match(/^file:\/\/\//)) {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
  } else {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
  }

  for (let i = 0; i < strArray.length; i++) {
    let component = strArray[i];

    if (typeof component !== 'string') {
      throw new TypeError('Url must be a string. Received ' + component);
    }

    if (component === '') {
      continue;
    }

    if (i > 0) {
      // Removing the starting slashes for each component but the first.
      component = component.replace(/^[\/]+/, '');
    }
    if (i < strArray.length - 1) {
      // Removing the ending slashes for each component but the last.
      component = component.replace(/[\/]+$/, '');
    } else {
      // For the last component we will combine multiple slashes to a single one.
      component = component.replace(/[\/]+$/, '/');
    }

    resultArray.push(component);
  }

  let str = resultArray.join('/');
  // Each input component is now separated by a single slash except the possible first plain protocol part.

  // remove trailing slash before parameters or hash
  str = str.replace(/\/(\?|&|#[^!])/g, '$1');

  // replace ? in parameters with &
  const parts = str.split('?');
  str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

  return str;
}

function urlJoin(...args) {
  const parts = Array.from(Array.isArray(args[0]) ? args[0] : args);
  return normalize(parts);
}

const METHODS = {
  GET: 'get', // get data
  POST: 'post', // create data
  PUT: 'put', // cover date
  PATCH: 'patch', // update a part of data
  DELETE: 'delete', // remove data
};

class RouteLoader {
  app = null;

  mixins = [];

  constructor(app) {
    this.app = app;
  }

  setRoute(rts, { rootPath = '', rootMiddleware = [] } = {}) {
    for (let i = 0; i < rts.length; i++) {
      const node = rts[i] || {};
      const {
        path: subPath,
        method = METHODS.GET,
        middleware = [],
        children = [],
        action,
        before,
      } = node;
      if (typeof subPath !== 'string') continue;
      const fullPath = urlJoin('/', rootPath, subPath);
      const middlewares = [...rootMiddleware, ...middleware];

      if (action) {
        console.log(`[${method.toUpperCase()}] registered:`, fullPath);
        let xaction = action;
        if (this.mixins) {
          this.mixins.forEach((mixin) => {
            xaction = mixin(xaction);
          });
        }

        this.app[method](fullPath, [...middlewares, xaction]);
      }

      if (children && children.length) {
        this.setRoute(children, {
          rootPath: fullPath,
          rootMiddleware: middlewares,
        });
      }
    }
  }

  addMixin(mixin) {
    this.mixins.push(mixin);
  }
}

export { RouteLoader, METHODS };
