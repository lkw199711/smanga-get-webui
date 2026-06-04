# get-webui 配置功能实现计划

## 背景

`get-webui` 目前已经有 `/config` 路由和导航入口，但页面仍是占位状态。实际配置数据保存在 `smanga-get` 项目的 `data/config.json` 中，后端已有 `get_config`、`set_config`、`dataRoot` 等工具方法，不过还没有对外暴露配置读写接口。

本计划先把配置功能拆成“后端配置 API + 前端配置页 + 校验与副作用处理”三部分，后续实现时按最小可用版本逐步落地。

## 现状梳理

### 前端 get-webui

- `src/router/index.ts` 已配置 `/config` 路由。
- `src/layout/nav.vue` 已有“配置”菜单入口。
- `src/views/config.vue` 当前只显示“配置功能开发中，敬请期待”。
- `src/api/index.ts` 已统一封装 axios，开发环境代理到 `/api`，生产环境使用 `VITE_API_URL` 或 `http://localhost:9800`。
- 现有 API 模式是每个资源独立一个文件，如 `src/api/task.ts`、`src/api/subscribe.ts`、`src/api/log.ts`。

### 后端 smanga-get

- `app/utils/index.ts` 中：
  - `dataRoot` 根据 `DATA_DIR` 或系统平台推导数据根目录。
  - `configFile` 固定为 `${dataRoot}data/config.json`。
  - `get_config(website?: string)` 读取并解析 JSON。
  - `set_config(config)` 当前采用顶层浅合并写回文件。
- `start/init.ts` 中：
  - `create_config()` 负责首次启动时创建 `data/` 和默认 `config.json`。
  - `create_scan_cron()` 读取 `cron.enable`、`cron.interval` 和 `cron.clearCookies`。
- `start/kernel.ts` 中：
  - 启动时读取 `immediately` 配置来决定是否添加即时任务。
  - 当前在 `create_config()` 前执行 `get_config().immediately`，首次启动无配置文件时存在空指针风险。
- `app/controllers/configs_controller.ts` 为空。
- `start/routes.ts` 已声明 `ConfigController` 变量，但还没有挂载 `/config` 路由。

## 配置文件结构

示例配置来自：

- `smanga-get/data-example/config.json`
- `smanga-get/data-example-docker/config.json`

建议先支持以下配置分组。

### 全局配置

- `headless`：浏览器是否无头运行，现有配置里存在 `1/0` 和 `true/false` 两种形态。
- `proxy`：代理配置，包含 `enable`、`server`、`username`、`password`。
- `cron`：定时任务配置，包含 `enable`、`interval`、`clearCookies`。
- `immediately`：启动后立即添加的任务开关。
- `endAfterSetCookie`：设置 Cookie 后退出程序。
- `shutdownAfterSetCookie`：设置 Cookie 后关机，工具方法已支持但示例配置未必都有。
- `autoRemoveSubscribe`、`watting`、`cacheRoot`：现有代码中有读取或示例字段，保留展示与编辑能力。
- `downloadPath`、`compressPath`：全局默认路径，部分服务使用站点内配置，仍建议保留。

### 站点配置

- `toomics`、`toomics-sc`、`toomics-tc`
  - `cookieFile`
  - `cookieFileNoUser`
  - `downloadPath`
  - `compressPath`
  - `coverCache`
  - `chapterCache`
  - `cloudPath`
  - `userName`
  - `passWord`
  - `scrollStep`
  - `scrollDelay`
  - `maxRetry`
  - `downloadLockedMeta`
  - `autoCompress`
  - `jumpExist`
  - `jumpMangas`
  - `updateOnlyDay`
  - `latestSyncCloud`
- `bilibili`
  - `cookieFile`
  - `downloadPath`
  - `compressPath`
  - `scrollStep`
  - `scrollDelay`
  - `downloadLockedMeta`
- `omegascans`
  - `cookieFile`
  - `downloadPath`
  - `compressPath`
  - `autoCompress`
  - `cloudPath`
  - `latestSyncCloud`
- `gentleman`
  - `cookieFile`
  - `downloadPath`
  - `organizePath`
  - `organize`
  - `compressPath`
  - `latestSyncCloud`

## 后端实现计划

1. 补齐配置工具层
   - 新增 `get_config_path()` 或暴露配置路径元信息，便于接口返回当前编辑的是哪个文件。
   - 将 `set_config` 的写入逻辑改为可控保存：
     - `replace_config(config)`：完整替换整个配置文件。
     - `patch_config(partial)`：深合并局部配置，避免保存 `cron.interval` 时覆盖整个 `cron` 对象。
   - 统一保证 `data/` 目录存在。
   - 处理 JSON 解析错误，返回可读错误信息，不让接口直接 500。

2. 补齐配置 Controller
   - `GET /config`：返回完整配置和元信息。
   - `PUT /config`：保存完整配置，用于表单整体提交。
   - `PATCH /config`：保存局部配置，用于后续分组保存或快速开关。
   - 可选 `GET /config/schema`：返回字段分组、类型、标签、默认值，用于前端动态渲染；第一版也可以先把 schema 放在前端。

3. 挂载路由
   - 在 `start/routes.ts` 增加：
     - `router.get('/config', [ConfigController, 'get'])`
     - `router.put('/config', [ConfigController, 'update'])`
     - `router.patch('/config', [ConfigController, 'patch'])`

4. 处理配置副作用
   - 保存 `cron` 后，需要重新调度定时任务，否则需要重启服务才生效。
   - 可以让 `ConfigsController.update/patch` 在检测到 `cron` 变更后调用 `create_scan_cron()`。
   - `immediately` 是启动时行为，保存后不应自动执行；如果需要立即执行，建议单独走任务接口。

5. 修复启动顺序风险
   - `start/kernel.ts` 应先执行 `create_config()`，再读取 `get_config()?.immediately ?? {}`。

## 前端实现计划

1. 新增配置 API
   - 新建 `src/api/config.ts`：
     - `get()`
     - `update(config)`
     - `patch(partial)`

2. 新增配置类型
   - 在 `src/type/index.ts` 或单独 `src/type/config.ts` 定义：
     - `AppConfig`
     - `CronConfig`
     - `ProxyConfig`
     - `ImmediatelyConfig`
     - `WebsiteConfig`
   - 对历史配置中的 `0/1` 和 `true/false` 做兼容，表单内统一用 boolean，提交前可统一转回 boolean。

3. 实现配置页布局
   - 保持现有 Element Plus 卡片风格。
   - 页面顶部放操作区：
     - 刷新
     - 保存
     - 重置未保存修改
     - 显示配置文件路径
   - 主体用 tabs 分组：
     - 基础
     - 代理
     - 定时任务
     - 启动任务
     - 站点配置
     - 原始 JSON

4. 表单字段设计
   - 布尔项使用 `el-switch`。
   - 路径、账号、cron 表达式使用 `el-input`。
   - 数字项如 `scrollStep`、`scrollDelay`、`maxRetry` 使用 `el-input-number`。
   - 密码字段 `passWord`、`proxy.password` 使用 password input。
   - `jumpMangas` 可先用 textarea，一行一个或 JSON 数组；第一版建议 textarea 降低实现复杂度。
   - `latestSyncCloud` 默认只读展示，可提供“清零/设为当前时间”这类明确操作，避免误改。

5. 原始 JSON 编辑
   - 提供一个“高级”区域显示格式化后的 JSON。
   - 用户编辑 JSON 后先 `JSON.parse` 校验，通过后才能保存。
   - 表单视图和 JSON 视图需要有一个单向同步策略：建议以表单为主，切到 JSON 时由当前表单生成 JSON；JSON 保存成功后回填表单。

6. 未保存状态
   - 拉取配置后保存一份 `originalConfig`。
   - 当前表单与原始配置比较后展示“有未保存修改”。
   - 离开页面前可二次确认，第一版可以先用保存按钮 loading 和重置按钮覆盖主要场景。

## 校验规则

- `cron.interval` 不能为空；可选引入 `node-cron` 服务端校验，或先做非空校验。
- `proxy.enable = true` 时，`proxy.server` 必填。
- 路径字段允许 Windows 与 Linux 格式，不做过度限制。
- 数字字段必须为正数：
  - `scrollStep > 0`
  - `scrollDelay >= 0`
  - `maxRetry >= 1`
- `passWord`、`proxy.password` 保存前不做脱敏；接口返回时可以先保持原值，后续如考虑安全再做单独策略。

## 风险与注意点

- 当前 `set_config` 是顶层浅合并，直接用于局部保存会覆盖嵌套对象，需要先补深合并或区分完整替换。
- `headless`、`cron.enable`、`immediately.*`、`autoCompress` 等字段历史上同时出现 `0/1` 和 boolean；前端需要兼容展示，后端最好统一保存为 boolean。
- 保存配置文件时应使用格式化 JSON，避免破坏人工可读性。
- 配置文件可能被服务运行时同时更新，例如 `latestSyncCloud`；保存完整配置前要考虑覆盖运行时写入。第一版可以在保存前重新拉取并提示，或优先使用 `PATCH` 分组保存。
- `create_scan_cron()` 的 `crons` 数组当前保存的是初始变量引用，重新赋值后的 cron 任务可能不会被数组追踪，后续如果做热更新定时任务，需要顺手修正任务停止逻辑。
- 生产 Docker 中 `/data/config.json` 由 init 脚本初始化，WebUI 保存的文件应与 `DATA_DIR` 指向保持一致。

## 推荐实施顺序

1. 后端修复启动顺序，并补齐配置读写工具。
2. 后端实现 `GET /config`、`PUT /config`、`PATCH /config` 和路由。
3. 前端新增 `src/api/config.ts` 与配置类型。
4. 前端先实现基础表单：
   - 基础
   - 代理
   - 定时任务
   - 启动任务
5. 前端再实现站点配置 tabs。
6. 增加原始 JSON 高级编辑区。
7. 验证保存后 `data/config.json` 内容正确，刷新页面可回显。
8. 验证修改 `cron` 后定时任务重新生效，修改 `immediately` 后仅影响下次启动。

## 第一版验收标准

- 打开 `/config` 可以看到当前 `data/config.json` 的主要配置。
- 修改任意配置并保存后，`smanga-get/data/config.json` 或 `DATA_DIR/data/config.json` 被正确更新。
- 保存嵌套配置时不会丢失同组其他字段。
- 刷新页面后配置能正确回显。
- 后端配置文件缺失时能自动创建或给出明确错误。
- JSON 非法时前端不提交，后端也不会写坏配置文件。
