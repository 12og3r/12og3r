# 个人博客设计文档

**日期**: 2026-05-02
**作者**: Roger Kwan
**状态**: Draft (待实现)

---

## 1. 概述

一个**纯前端**的个人博客，视觉走「digital + hack」方向（黑底绿字、等宽字体、CRT 扫描线），文章阅读体验是**渐进式解锁**的（章节级打字机效果，按键/点击触发下一章）。支持中英双语，多端响应式（桌面 / 平板 / 手机）。

### 1.1 目标

- 一个有视觉记忆点的个人博客 —— 不要 SaaS 模板，不要 generic AI 美学
- 阅读体验有一定**游戏化**仪式感，但不能伤害**回访**和**SEO**
- 写起来不痛苦：Markdown / MDX 写作，构建出静态站点
- 多端可用（桌面 + 移动 + 平板）
- 支持中英文，可在文章内任意切换

### 1.2 非目标 (YAGNI)

明确**不做**的功能：
- ❌ 评论系统（暂不需要）
- ❌ 用户登录 / 个性化推荐
- ❌ 浏览统计 / 埋点（如果以后想加，用 Plausible / Umami 这类轻量方案）
- ❌ 后端服务（纯静态站，部署到 GitHub Pages / Vercel / Netlify）
- ❌ 全文搜索（首期靠 tag 筛选；如果后期文章 > 100 篇再考虑加 `/` 命令面板）
- ❌ 自动翻译（所有翻译由作者手写）
- ❌ 多作者支持

---

## 2. 视觉风格

### 2.1 整体调性

**Terminal / Hacker Engineering 风格**：

- **配色**：黑底（`#000`） + 主色绿（`#00ff66`） + 辅助色琥珀（`#ffcc66`）和品红（`#ff66cc`）
- **字体**：等宽 `JetBrains Mono`（拉丁字符）+ `Noto Sans SC` / `PingFang SC`（中文）
- **CRT 质感**：全局轻度扫描线（`repeating-linear-gradient`） + 暗角（`radial-gradient` 边缘渐黑）
- **动效约束**：尊重 `prefers-reduced-motion`，开启时禁用打字机效果和闪烁

### 2.2 视觉细节

| 元素 | 处理 |
|---|---|
| 链接 | 绿色 + 点状下划线，hover 反白 |
| 边框 | `1px dashed #1a3a1a` 或 `1px solid #2a4a2a`，深绿色 |
| 标签 pill | 边框框 + 透明底；选中态：实心绿底 + 黑字 |
| 文字层级 | 主文 `#ccc` / 次要 `#888` / 极弱 `#555` |
| 状态指示 | 用 `●`（脉冲）/ `▸` / `╔═╗` ASCII 框装饰 |
| 终端提示符 | `$`、`▸`、`~` 用作小型装饰 |

### 2.3 不要的东西

- ❌ 渐变（除暗角和顶栏背景模糊外）
- ❌ 阴影（除发光效果外）
- ❌ 圆角（保持锐利方角，`border-radius: 0`）
- ❌ 过度动画（每个动效必须有意义，不要 micro-interaction 堆砌）
- ❌ 紫色 + 白底（generic AI 配色）

---

## 3. 页面结构

### 3.1 路由

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 / Dashboard | 标签 + Now + 文章列表 |
| `/posts/<slug>` | 文章详情 | 渐进式解锁阅读视图 |
| `/about` | 关于 | 简介 + 联系方式 |
| `/404` | 错误页 | `bash: command not found` 风格 |
| `/rss.xml` | RSS feed | 标准 Atom / RSS feed |

**i18n 路由**：`/en/...` 和 `/zh/...` 前缀，根 `/` 重定向到默认语言（EN）。例如 `/zh/posts/0034-debugging-anr`。

### 3.2 顶栏导航

固定在所有页面顶部：

```
[● ROGER@BLOG]            ~  /about         [EN] [中文]
```

- 左：品牌 + 心跳脉冲点（绿色 8px 圆点 + glow）
- 中：导航链接 `~`（首页）和 `/about`（关于）
- 右：语言切换 pill `[EN] [中文]`，当前语言反白高亮
- 移动端：导航换到第二行 / 隐藏部分元素

**故意去掉的**：`/posts` `/tags` `/rss` 入口（重复或非高频，分别由首页本身、侧栏 tags、页脚 RSS 链接覆盖）

### 3.3 页脚

```
© 2026 roger kwan · github · rss · twitter
```

- 极简
- RSS 链接在这里，对订阅用户仍可见

---

## 4. 首页（Dashboard）

### 4.1 布局

桌面端：双列网格

```
+----------+--------------------------------+
|          |                                |
| sidebar  |   main (post list)             |
|  240px   |                                |
|          |                                |
+----------+--------------------------------+
```

移动端：单列堆叠（sidebar 在上、posts 在下）。

### 4.2 侧栏（2 个面板）

#### Panel 1: `// tags`

- 标签云，按文章数排序
- 显示标签名 + 文章数（如 `#android` `18`）
- **多选 toggle**：点击 = 加入筛选，再点 = 移除
- 选中态：实心绿底 + 黑字
- 选中数量徽章：右上角 `已选 N` 小标签
- **筛选逻辑：并集（OR）** —— 文章只要带任意一个选中标签就显示

#### Panel 2: `// now`

- 个人锚点，类似 [nownownow.com](https://nownownow.com)
- 三行内容：
  - `work:` 当前工作
  - `read:` 在读
  - `build:` 在做的事
- 底部显示 `last updated: YYYY-MM-DD`
- **手动维护承诺**：建议每月至少更新一次。**不维护就显得过时尴尬**。

### 4.3 主区（文章列表）

- 标题：`// posts — 47 entries`（数字随文章数动态变化）
- 排序选项：默认 newest（暂时不做其它排序选项）
- **筛选状态条**：仅在选中至少一个标签时显示
  ```
  filtering by: #android #debugging         [ clear ]
  ```
- 文章列表项布局：
  - 左：日期 `2026.04.28`（80px）
  - 中：标题（绿色） + 标签（品红色 `#xxx #yyy`）
  - 右：阅读时长 + 文章编号 `8 min · 0034`（移动端隐藏）
- **已读标记**：标题前显示 `✓`（淡绿色），基于 `localStorage` 中的已读 set
- 列表分隔：`1px dashed`
- 翻页：底部 `[ load 20 more... ]` 按钮（不要无限滚动）

### 4.4 URL 状态

筛选状态反映到 URL：

```
/?tags=android,debugging
```

- 点击标签 → 更新 query string，浏览器历史可前进/后退
- 直接访问带 `?tags=` 的 URL → 加载时自动应用筛选

### 4.5 空状态

如果筛选结果为 0（注：OR 逻辑下空状态较难触发，仅在标签全部为 0 文章的边缘情况）：

```
no posts match this combination of tags.
[ clear ] to reset.
```

---

## 5. 文章详情页（渐进式解锁阅读）

### 5.1 核心交互

文章正文按**章节**分段（不是按段落），用户每解锁一章触发一次「打字机」动画。

- 章节数量：建议 3-6 个 / 篇（不强制）
- 每章长度：建议 100-300 字
- 章节定义：在 MDX 正文中用 `---chapter: <title>---` 分隔符标记。章节数从 MDX 内容中自动派生，**不需要在 meta.yaml 中重复声明**。
- 章末出现可点击的「继续」提示：
  - 桌面：`press ENTER or SPACE to continue`
  - 移动：`▸ TAP to continue`（整行宽 60+ px 高的可点区域）

### 5.2 打字机节奏

- **基础速度**：~8ms/字符（爆发式，不是慢吞吞）
- **标点停顿**：句号/问号/叹号 → 160ms；逗号/分号 → 70ms；换行 → 40ms
- **代码块**：**直接 dump，不逐字打**（终端真实行为：代码就是 `cat` 出来的整块）
- **中文**：单字稍慢，~12ms/字符（中文字符密度更高）

### 5.3 顶栏指示器

文章页顶部固定栏（替代默认的 brand + nav）：

- **左**：章节进度 `CH 2 / 4`
- **右**：`SKIP ▸▸` 按钮（永远可见，跳过所有动画显示全文）

「已读」定义：用户解锁了最后一章 **或** 点击了 `SKIP` 按钮。两种情况都标记 `localStorage["blog.read"]` 加入该 slug。

### 5.4 状态持久化（localStorage）

**Per-post 已读状态**：

```js
localStorage["blog.read"] = ["0034", "0033", "0031"]
```

- 第一次访问 → 完整解锁体验
- 已读过 → 直接显示全文，跳过打字机
- 「已读」定义：用户解锁了最后一章 OR 点了 `SKIP`

**优势**：
- 老读者回访不被劫持
- 列表页能展示 `✓` 已读标记
- SEO：完整文本始终在 DOM 中（用 CSS visibility 控制可见性，不影响爬虫和读屏软件）

### 5.5 文章末尾

最后一章解锁后显示：

```
◆ END_OF_TRANSMISSION ◆
// thanks for reading

← prev: <prev post title>     next: <next post title> →
```

- 一个简单的"完成"标记，不夸张
- **prev / next 导航**（按时间顺序）—— 默认包含，提高文章间跳转

### 5.6 Reduced Motion 处理

```css
@media (prefers-reduced-motion: reduce) {
  /* 禁用打字机和闪烁 */
}
```

- 直接显示全文，所有章节同时可见
- 跳过 SKIP 按钮也无意义，直接隐藏
- 顶栏指示器仍显示（用于知道当前是文章页）

### 5.7 可访问性

- 所有正文文本始终在 DOM 中（包括尚未解锁的章节，仅 visually hidden 用 `aria-hidden="false"` + `visibility: hidden` 或类似手法）
- 屏幕阅读器读全文，不被打字机打断
- 键盘导航：Enter / Space 推进，Escape 跳过，R 重置（仅作彩蛋）

---

## 6. 关于页（/about）

- 比文章简单，不需要章节解锁
- 可以用一段终端风的「自我介绍」，类似 `cat about.md` 的输出
- 包括：简介、当前工作、过往经历、联系方式（GitHub / Twitter / Email）
- 双语版本

---

## 7. 错误页（/404）

- 终端报错风格：

```
$ cat /posts/<requested-path>
bash: <requested-path>: No such file or directory

did you mean:
  $ cd ~              [home]
  $ ls posts/         [browse]
```

- 双语

---

## 8. 国际化（i18n）

### 8.1 支持语言

- **首期**：英文（`en`，默认） + 简体中文（`zh`）
- 不做自动翻译，**所有翻译由作者手写**

### 8.2 文章内容结构

每篇文章在 `content/posts/<slug>/` 目录下：

```
content/posts/0034-debugging-anr/
├── meta.yaml          # 通用元数据
├── en.mdx             # 英文版
└── zh.mdx             # 中文版
```

`meta.yaml` 示例：

```yaml
slug: 0034-debugging-anr
date: 2026-04-28
tags: [android, debugging]
readingTime:
  en: 8
  zh: 9
pinned: false   # 是否在首页强调（首期不做 pinned 列表，可保留字段）
```

章节数从 MDX 内容自动派生（统计 `---chapter:` 分隔符数量）。en 和 zh 章节数必须一致，构建时校验。

每个 `.mdx` 文件用章节分隔符标记：

```mdx
---chapter: the call---

It was 2:47 AM when the alert fired...

---chapter: the trace---

Reading ANR traces is pattern recognition...
```

### 8.3 UI 字符串

UI chrome 翻译统一在 `src/i18n/{en,zh}.json` 中：

```json
// en.json
{
  "nav.about": "/about",
  "panel.tags": "// tags",
  "panel.now": "// now",
  "filter.label": "filtering by:",
  "count.entries": "— {n} entries",
  ...
}
```

支持简单变量替换 `{n}`。

### 8.4 切换行为

- 切换器：右上角 `[EN] [中文]` pill
- **任何页面切换都生效**（首页、文章页、关于页）
- **文章页中切换**：
  - 已解锁的章节内容**瞬间替换**（不再重新打字，避免读者干等）
  - 还没解锁的章节继续锁着，但解锁后用新语言打字
  - 整体配 ~400ms 的 **CRT glitch 闪烁**（hue-rotate + 抖动 + 亮度脉冲），让切换感知到
  - 阅读进度（已解锁到第几章）保留
- localStorage 记忆语言选择，下次访问保持

### 8.5 标签处理

- 标签本身保留英文（`#android` `#debugging`），不翻译 —— 它们是分类标识符，约定俗成
- 标签**面板标题**翻译（`// tags` → `// 标签`）

### 8.6 路由策略

- `/en/posts/<slug>` 和 `/zh/posts/<slug>` 独立 URL
- 切换语言 → 客户端路由跳到对应语言路径，但保留滚动位置和文章状态
- SEO：分别索引；用 `<link rel="alternate" hreflang="...">` 标签声明

### 8.7 字体策略

```css
body[data-lang="en"] { font-family: 'JetBrains Mono', monospace; }
body[data-lang="zh"] {
  font-family: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 13.5px;  /* 微调，让中英文视觉权重一致 */
}
```

---

## 9. 技术栈

### 9.1 核心

- **框架**：React 18+
- **构建**：Vite 5+
- **语言**：TypeScript（推荐，类型安全）
- **样式**：CSS Modules 或 vanilla CSS（保持轻量；不引入 Tailwind / styled-components 等复杂方案）

### 9.2 关键依赖

| 用途 | 选型 | 备注 |
|---|---|---|
| 路由 | `react-router-dom` v6 | 标准方案 |
| 静态站点生成 | `vite-plugin-ssg` 或 `vite-ssg` | SEO 必需 |
| MDX 处理 | `@mdx-js/rollup` + `@mdx-js/react` | Markdown + React 组件 |
| Frontmatter 解析 | `gray-matter` | 解析 meta.yaml |
| 代码高亮 | `shiki` | 构建时高亮，零运行时开销 |
| RSS 生成 | 自写 `scripts/build-rss.ts` | 简单，约 50 行 |
| 字体 | Google Fonts (`JetBrains Mono` + `Noto Sans SC`) | self-host 优化首屏 |

### 9.3 不引入

- ❌ Tailwind / Emotion / styled-components（CSS Modules 足够）
- ❌ Redux / Zustand / Jotai（用 React Context + useState 即可）
- ❌ i18next（自写一个简单的 i18n hook，覆盖 90% 场景，<100 行）

### 9.4 项目结构

```
blog/
├── content/
│   └── posts/
│       └── 0034-debugging-anr/
│           ├── meta.yaml
│           ├── en.mdx
│           └── zh.mdx
├── public/
│   └── ...static assets
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── Post.tsx
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── TopBar.tsx
│   │   ├── TagCloud.tsx
│   │   ├── NowPanel.tsx
│   │   ├── PostList.tsx
│   │   ├── ChapterReader.tsx       # 渐进式解锁核心组件
│   │   └── LangSwitcher.tsx
│   ├── hooks/
│   │   ├── useI18n.ts
│   │   ├── useTypewriter.ts        # 打字机时序 hook
│   │   ├── useReadStatus.ts
│   │   └── useTagFilter.ts
│   ├── i18n/
│   │   ├── en.json
│   │   └── zh.json
│   ├── lib/
│   │   ├── content.ts              # 加载 / 解析 posts
│   │   └── chapters.ts             # 章节分隔解析
│   └── styles/
│       └── global.css
├── scripts/
│   └── build-rss.ts
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-02-personal-blog-design.md  ← 本文档
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 9.5 部署

- **目标平台**：GitHub Pages / Vercel / Netlify（任选其一）
- **构建产物**：纯静态 HTML / CSS / JS
- **CI/CD**：GitHub Actions，push 到 main 自动构建部署

---

## 10. 状态持久化

### 10.1 localStorage Keys

| Key | 类型 | 用途 |
|---|---|---|
| `blog.lang` | `"en" \| "zh"` | 用户语言偏好 |
| `blog.read` | `string[]` | 已读文章 slug 列表 |
| `blog.firstVisit` | `boolean` | 是否首次访问（彩蛋触发） |

### 10.2 URL 状态

仅首页支持 URL 同步状态：

- `/en?tags=android,debugging` 或 `/zh?tags=android,debugging` → 标签筛选
- query string 与 i18n 路由前缀共存

文章页不需要 URL 状态（章节解锁状态走 localStorage，不入 URL，避免分享链接时强制跳过解锁）。

---

## 11. 性能与可访问性

### 11.1 性能目标

- **First Contentful Paint** < 1.5s（4G）
- **Time to Interactive** < 3s
- **Bundle size** < 200KB（gzipped, 不含字体）
- 字体使用 `font-display: swap`，防止打字机效果被字体加载阻塞

### 11.2 SEO

- **静态生成**：每个语言每个文章构建出独立 HTML（`/en/posts/<slug>.html`）
- **完整内容**：未解锁章节的文本始终在 DOM 中。视觉上用 CSS 类（如 `.chapter--locked { opacity: 0; pointer-events: none; }`）控制可见性。**不使用 `display: none`**，否则爬虫和读屏软件会认为内容不存在。`aria-hidden` 不设置（让屏幕阅读器读取全文）
- **结构化数据**：`<article>` `<time>` `<meta>` 标准标签
- **sitemap.xml**：构建时自动生成

### 11.3 可访问性

- 颜色对比度通过 WCAG AA（绿底配黑字 / 黑底配亮绿都过）
- 所有交互元素键盘可达（tab 顺序合理）
- `prefers-reduced-motion: reduce` 时禁用打字机和 glitch
- ARIA 标签：导航、面板、文章 article 等

---

## 12. 开放问题（实现时需要确认）

这些是 brainstorm 阶段没完全敲定的事项，实现时再决定：

1. **文章 ID 格式** —— 现 mockup 中用 `0034` 这种 4 位编号。要不要保留？还是 `2026-04-28-anr-debugging` 这种日期-slug 格式？
2. **搜索功能** —— 首期不做。但什么时候触发"该加了"？我建议文章数到 80+ 时再考虑（按 `/` 弹出命令面板）
3. **文章字体大小** —— 14px 等宽适合代码，但读 5000 字长文可能需要 15-16px。需要正式实现后实测
4. **"now" 内容更新机制** —— 是手动改源码 commit，还是用一个简单的 `now.yaml` 不需要改 React 代码？倾向后者
5. **彩蛋触发** —— 首次访问的彩蛋具体是啥？开机自检画面？konami code？等实现时再脑暴
6. **文章封面/插图** —— 是否支持？暂不做（一致性 + 极简 + 加载性能）
7. **代码主题** —— shiki 自带的 dark 主题颜色可能和我们的全局绿色冲突，需要自定义一个 monochrome 绿色主题

---

## 13. 验收标准

实现完成的判据：

- [ ] 桌面端首页加载 < 1.5s（Lighthouse 测）
- [ ] 移动端首页布局正确，无横向滚动
- [ ] 标签 OR 筛选交互工作正常，URL 同步
- [ ] 至少有 3 篇示例文章（中英双语）
- [ ] 文章页打字机效果工作正常，章节解锁触发响应
- [ ] 已读状态持久化，回访跳过打字机
- [ ] 语言切换在所有页面生效
- [ ] 文章页中切换语言：已解锁内容瞬切，未解锁继续锁
- [ ] `prefers-reduced-motion` 下行为正确
- [ ] RSS feed 生成正确
- [ ] sitemap.xml 生成正确
- [ ] 部署到生产环境，HTTPS 工作
- [ ] Lighthouse SEO score > 95

---

## 14. 时间预估（粗）

非 commitment，仅参考：

| 阶段 | 估时 |
|---|---|
| 项目脚手架 + 基础布局 | 0.5 天 |
| 首页（dashboard + tag 筛选） | 1 天 |
| 文章渲染 + MDX + 章节解析 | 1 天 |
| 渐进式打字机解锁（核心交互） | 1.5 天 |
| i18n 系统 | 1 天 |
| 关于页 + 404 + RSS | 0.5 天 |
| 响应式调优（移动端） | 1 天 |
| 视觉打磨 + 内容填充（3 篇示例） | 1 天 |
| 部署 + 测试 | 0.5 天 |
| **总计** | **~8 天**（业余时间 2-3 周） |

---

*本文档由 brainstorm 会话生成，是后续 implementation plan 的基础。*
