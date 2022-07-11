方便统一配置路由，设置中间件

### routes

`routes.js`

```javascript
const routes = [
  {
    path: 'v1',
    children: [
      {
        path: 'image',
        children: [
          {
            path: 'upload',
            middleware: [],
            method: 'post',
            action: () => {},
          },
        ],
      },
    ],
  },
];

export default routes;
```

visit api url `/v1/image/upload`

```javascript
import routes from './routes';
import express from 'express';
const app = express();

const routeLoader = new RouteLoader(app);
routeLoader.setRoute(routes);

app.listen(PORT || 3000, () => {});
```

### middleware

`auth.js`

```javascript
export default (req, res, next) => {
  // do someting
  next();
};
```

on `routes.js`

```javascript
import auth from './auth';

const routes = [
  {
    path: '/board',
    middleware: [auth],
    action: (req, res) => {
      res.json({});
    },
  },
];
```

### mixin

`mixin.js`

```javascript
import moment from 'moment';

export default (action) => {
  return async (req, res) => {
    res.xjson = (data) => {
      return res.json(response(data));
    };

    console.log.log('[START]');

    await action(req, res, {
      moment,
    });

    console.log(`[END]`);
  };
};
```

add mixin

```javascript
import actionMixin from './mixin';

const routeLoader = new RouteLoader(app);
// add before setRoute
routeLoader.addMixin(actionMixin);
routeLoader.setRoute(routes);
```

`test.js`

```javascript
export default (req, res, { moment }) {
  res.json({
    date: moment().format('YYYY/MM/DD')
  })
}
```

```javascript
import testAction from './test';

const routes = [
  {
    path: 'v1',
    children: [
      {
        path: 'image',
        children: [
          {
            path: 'upload',
            middleware: [],
            method: 'post',
            action: testAction,
          },
        ],
      },
    ],
  },
];

export default routes;
```
