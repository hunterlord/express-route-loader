方便统一配置路由，设置中间件

# V2

```
npm i express-route-xloader@2
```

```javascript
import { rtl } from 'express-route-xloader';
import express from 'express';
import path from 'path';
const app = express();

(async () => {
  await rtl(app)(path.resolve(__dirname, './actions/'));
  await rtl(app)(path.resolve(__dirname, './basicActions/'));

  app.use((rr, req, res, next) => {
    res.status(500);
    res.json({
      code: 'E500',
      message: 'ERR。',
    });
  });

  app.listen(3000, () => {
    console.log(`app is startd.`);
  });
})();
```

### folder

```
  ▾ actions/                   |~
    ▸ test/                    |~
    ▸ v1/                      |~
      _mixin.js                |~
```

### 设置中间件

```javascript
  ▾ actions/                   |~
    ▾ test/                      |~
      ▸ v1/                  |~
    _middlewares.js        |~
```

\_middlewares.js 必须返回中间件数组, 中间件方法名请设为不同名称，action 需要排除中间件时需要。

```javascript
const middleware = async (req, res, next) => {
  next();
};

const middlewares = [middleware];
export default middlewares;
```

### 改造每个 action - mixin

该文件放在 action 文件夹根目录，已让全部修改生效\_mixin.js

```javascript
import moment from 'moment';

const params = (action) => {
  return async (req, res, next) => {
    await action({
      moment,
      req,
      res,
      next,
    });
  };
};

// 错误捕捉
const error = (action) => {
  return async (params) => {
    const { res } = params;
    try {
      const result = await action(params);
      if (!res.headersSent) {
        res.json({
          code: 'S000',
          message: 'SUCCESSED.',
          ...result,
        });
      }
    } catch (e) {
      const [code, message] = Array.isArray(e) ? e : ['E000', e.message];
      if (envs.ENV === 'LOCAL') {
        logger.error('Mixin Catched Error: ', e);
      }
      res.json({
        code,
        message,
      });
    }
  };
};

const mixins = [params, error];
export default mixins;
```

之后就 action 就可以通过第一个参数获取 moment

```javascript
export default async ({ moment, next, req, res }) => {};
```

### action

可以返回 3 个参数

```javascript
const url = '/test/:uid'; // 不返回时路由名称以文件名为准
const method = 'post'; // 不返回时默认get
const exceptMiddlewares = ['auth']; // 排除中间件， 所有中间不应该用相同的名字, 如果中间件名字相同，则会同时排除
export default async () => {}; // action
```

---

### 404

````javascript

设置 ./basicActions/ 文件夹
放置404.js

```javascript
export const url = '*';
export default async ({ res }) => {
   res.send('404 - Page Not Found.');
};
````

# V1

```
npm i express-route-xloader@1
```

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
