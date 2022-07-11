import urljoin from 'url-join';

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
      const fullPath = urljoin('/', rootPath, subPath);
      const middlewares = [...rootMiddleware, ...middleware];

      if (action) {
        console.log(`[${method.toUpperCase()}] registered:`, fullPath);
        let xaction = typeof action === 'string' ? require(action).default : action;
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
