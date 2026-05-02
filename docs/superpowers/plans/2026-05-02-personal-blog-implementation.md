# 个人博客实现 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个纯前端的个人博客，终端 / hacker 美学，支持渐进式章节解锁阅读、多选 OR 标签筛选、中英双语切换，部署为静态站点。

**Architecture:** Vite + React 18 + TypeScript 单页应用，构建时静态生成（vite-ssg），MDX 处理文章内容（每篇文章 EN/ZH 双语版本），自写轻量 i18n hook，localStorage 持久化已读状态和语言偏好。

**Tech Stack:** Vite 5, React 18, TypeScript 5, react-router-dom v6, MDX, gray-matter, shiki, vitest + @testing-library/react

---

## 项目文件结构

实现完成时的目录结构：

```
blog/
├── content/
│   └── posts/
│       └── 0034-debugging-anr/
│           ├── meta.yaml
│           ├── en.mdx
│           └── zh.mdx
├── public/
│   └── fonts/                       # self-hosted fonts
├── src/
│   ├── main.tsx                     # 入口
│   ├── App.tsx                      # Router 配置
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── Post.tsx
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── TopBar.tsx
│   │   ├── LangSwitcher.tsx
│   │   ├── TagCloud.tsx
│   │   ├── NowPanel.tsx
│   │   ├── PostList.tsx
│   │   └── ChapterReader.tsx
│   ├── hooks/
│   │   ├── useI18n.ts
│   │   ├── useTypewriter.ts
│   │   ├── useReadStatus.ts
│   │   └── useTagFilter.ts
│   ├── lib/
│   │   ├── content.ts               # 加载文章
│   │   ├── chapters.ts              # 章节分隔解析
│   │   └── rss.ts                   # RSS XML 生成
│   ├── i18n/
│   │   ├── en.json
│   │   └── zh.json
│   ├── styles/
│   │   └── global.css
│   └── types.ts                     # 全局类型定义
├── scripts/
│   ├── build-rss.ts
│   └── build-sitemap.ts
├── tests/
│   └── ... (与 src 镜像)
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-05-02-personal-blog-design.md
│       └── plans/
│           └── 2026-05-02-personal-blog-implementation.md  ← 本文档
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── .gitignore
```

**职责分割原则**：
- `routes/` 只做路由级页面组装（聚合 components + hooks），无业务逻辑
- `components/` 是可复用 UI 组件，无路由耦合
- `hooks/` 是可测试的状态/副作用逻辑
- `lib/` 是纯函数模块（Node 和浏览器都能跑），易测试
- `i18n/` 是数据，UI 字符串
- 测试文件镜像源代码结构

---

## Phase 1: 项目脚手架

### Task 1: 初始化 Vite + React + TypeScript 项目

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`

- [ ] **Step 1: 初始化 npm 项目**

工作目录：`/Users/roger/projects/blog`（已存在 `.git` 和 `docs/`）

```bash
cd /Users/roger/projects/blog
npm init -y
```

预期：生成 `package.json`。

- [ ] **Step 2: 安装核心依赖**

```bash
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/node
```

- [ ] **Step 3: 写 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Note: `baseUrl` is intentionally omitted — TypeScript 6+ deprecates it and requires path values to start with `./` when no `baseUrl` is set. Resolution under `moduleResolution: "bundler"` is identical.

- [ ] **Step 4: 写 `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "scripts/**/*"]
}
```

- [ ] **Step 5: 写 `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5173 },
});
```

- [ ] **Step 6: 写 `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>roger@blog</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 写 `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 8: 写最小 `src/App.tsx`**

```tsx
export default function App() {
  return <div style={{ padding: 40, color: '#00ff66', fontFamily: 'monospace' }}>roger@blog: bootstrap ok.</div>;
}
```

- [ ] **Step 8b: 写 `src/vite-env.d.ts`**（Vite 客户端环境的 ambient 类型，CSS side-effect import 需要）

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: 写最小 `src/styles/global.css`**

```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #000; color: #ccc; min-height: 100vh; }
```

- [ ] **Step 10: 修改 `package.json`**

在 `package.json` 顶层加 `"private": true`（防止误发布到 npm registry），并替换 `scripts`：

```json
"private": true,
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "type-check": "tsc --noEmit"
}
```

也建议清理 `npm init -y` 留下的 `"main": "index.js"` / `"directories"` / 空 `description` / `keywords` 等无用字段（不阻塞构建，但 `main: "index.js"` 是误导）。

- [ ] **Step 11: 验证完整 toolchain**

```bash
npm run type-check    # 期望 exit 0
npm run build         # 期望 exit 0，产出 dist/index.html + dist/assets/
```

可选 dev 验证（需要时打开浏览器看 `http://localhost:5173/` 上是否显示 "roger@blog: bootstrap ok."）：
```bash
npm run dev
```

- [ ] **Step 12: 提交**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 2: 测试框架（Vitest + Testing Library）

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/smoke.test.ts`

- [ ] **Step 1: 安装测试依赖**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: 写 `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
```

- [ ] **Step 3: 写 `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 4: 写 `tests/smoke.test.ts`**（验证测试框架）

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: 添加测试 npm 脚本**

修改 `package.json` 的 `scripts`：

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 6: 运行测试验证通过**

```bash
npm run test:run
```

预期：1 个测试通过，输出包含 `1 passed`。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "test: configure vitest with testing library"
```

---

## Phase 2: 全局样式和类型

### Task 3: 全局 CSS（终端美学）

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: 替换 `src/styles/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');

:root {
  --bg: #000;
  --fg: #ccc;
  --fg-dim: #888;
  --fg-faint: #555;
  --green: #00ff66;
  --green-dim: #88ff88;
  --green-shadow: rgba(0, 255, 102, 0.3);
  --green-line: #1a3a1a;
  --green-line-soft: #2a4a2a;
  --green-bg-soft: rgba(0, 20, 8, 0.3);
  --yellow: #ffcc66;
  --pink: #ff66cc;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --font-zh: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.65;
  min-height: 100vh;
  overscroll-behavior-y: none;
}

body[data-lang="zh"] {
  font-family: var(--font-zh);
  font-size: 13.5px;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(0deg,
    rgba(0,255,102,0.018) 0px, rgba(0,255,102,0.018) 1px,
    transparent 1px, transparent 4px);
  pointer-events: none;
  z-index: 100;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
  z-index: 99;
}

body.lang-switching {
  animation: glitch 0.4s;
}

@keyframes glitch {
  0%, 100% { filter: none; }
  20% { filter: hue-rotate(30deg) brightness(1.3); transform: translateX(-1px); }
  40% { filter: hue-rotate(-30deg) brightness(0.9); transform: translateX(1px); }
  60% { filter: brightness(1.5); }
}

a, a:visited {
  color: var(--green);
  text-decoration: none;
  border-bottom: 1px dotted var(--green);
}
a:hover { background: var(--green); color: #000; }

@media (prefers-reduced-motion: reduce) {
  body::before, body::after { display: none; }
  body.lang-switching { animation: none; }
}
```

- [ ] **Step 2: 临时调整 `src/App.tsx` 验证视觉**

```tsx
export default function App() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: 'var(--green)' }}>ROGER@BLOG</h1>
      <p>terminal aesthetic preview.</p>
      <p>scan lines? <a href="#">yes</a></p>
    </div>
  );
}
```

- [ ] **Step 3: 启动 dev 检查视觉**

```bash
npm run dev
```

预期：黑底，绿色 H1，扫描线和暗角可见，链接绿色点状下划线。Ctrl-C 关闭。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "style: add terminal aesthetic global CSS"
```

---

### Task 4: 全局类型定义

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: 写 `src/types.ts`**

```ts
export type Lang = 'en' | 'zh';

export interface PostMeta {
  slug: string;
  date: string;        // ISO 8601 (YYYY-MM-DD)
  tags: string[];
  readingTime: { en: number; zh: number };
  pinned?: boolean;
}

export interface Chapter {
  title: string;       // 如 "the call"
  body: string;        // 该章节的 MDX/Markdown 文本
}

export interface Post {
  meta: PostMeta;
  chapters: { en: Chapter[]; zh: Chapter[] };
}

export interface PostSummary {
  meta: PostMeta;
  title: { en: string; zh: string };  // 文章主标题（取第一章 title 或 frontmatter 中标题字段）
}

export interface NowEntry {
  work: { en: string; zh: string };
  read: { en: string; zh: string };
  build: { en: string; zh: string };
  lastUpdated: string; // ISO 8601
}
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat: add core type definitions"
```

---

## Phase 3: 内容加载与解析（纯函数 + TDD）

### Task 5: 章节解析器（pure function, TDD）

**Files:**
- Create: `tests/lib/chapters.test.ts`, `src/lib/chapters.ts`

- [ ] **Step 1: 写失败的测试 `tests/lib/chapters.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { parseChapters } from '@/lib/chapters';

describe('parseChapters', () => {
  it('splits text by ---chapter: markers', () => {
    const input = `---chapter: the call---

It was 2:47 AM.

---chapter: the trace---

Reading ANR traces.`;
    const result = parseChapters(input);
    expect(result).toEqual([
      { title: 'the call', body: 'It was 2:47 AM.' },
      { title: 'the trace', body: 'Reading ANR traces.' },
    ]);
  });

  it('returns one chapter with no marker (entire body, untitled)', () => {
    const result = parseChapters('Just plain text.');
    expect(result).toEqual([{ title: '', body: 'Just plain text.' }]);
  });

  it('trims whitespace from body', () => {
    const result = parseChapters(`---chapter: a---\n\n  hello world  \n\n`);
    expect(result).toEqual([{ title: 'a', body: 'hello world' }]);
  });

  it('throws if first content is non-empty before any marker', () => {
    expect(() => parseChapters(`stray text\n---chapter: a---\nbody`)).toThrow(/before first chapter marker/i);
  });

  it('handles empty input', () => {
    expect(parseChapters('')).toEqual([{ title: '', body: '' }]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm run test:run -- tests/lib/chapters.test.ts
```

预期：失败，提示找不到模块 `@/lib/chapters`。

- [ ] **Step 3: 实现 `src/lib/chapters.ts`**

```ts
import type { Chapter } from '@/types';

const MARKER = /^---chapter:\s*(.*?)\s*---\s*$/m;

export function parseChapters(text: string): Chapter[] {
  if (!text) return [{ title: '', body: '' }];

  const lines = text.split('\n');
  let currentTitle = '';
  let currentBody: string[] = [];
  const out: Chapter[] = [];
  let sawAnyMarker = false;

  const flush = () => {
    out.push({ title: currentTitle, body: currentBody.join('\n').trim() });
  };

  for (const line of lines) {
    const m = line.match(MARKER);
    if (m) {
      if (sawAnyMarker) flush();
      else if (currentBody.some(l => l.trim() !== '')) {
        throw new Error('Content found before first chapter marker');
      }
      currentTitle = m[1];
      currentBody = [];
      sawAnyMarker = true;
    } else {
      currentBody.push(line);
    }
  }

  if (sawAnyMarker) {
    flush();
  } else {
    out.push({ title: '', body: currentBody.join('\n').trim() });
  }

  return out;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm run test:run -- tests/lib/chapters.test.ts
```

预期：5 个测试全部通过。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add chapter parser for MDX content"
```

---

### Task 6: 内容加载器（vite glob import + meta.yaml）

**Files:**
- Create: `tests/lib/content.test.ts`, `src/lib/content.ts`
- Create: `content/posts/0034-debugging-anr/meta.yaml`, `content/posts/0034-debugging-anr/en.mdx`, `content/posts/0034-debugging-anr/zh.mdx` (sample fixture)

- [ ] **Step 1: 安装 yaml + frontmatter 依赖**

```bash
npm install -D yaml gray-matter
```

- [ ] **Step 2: 创建 sample 文章 `content/posts/0034-debugging-anr/meta.yaml`**

```yaml
slug: 0034-debugging-anr
date: 2026-04-28
tags:
  - android
  - debugging
readingTime:
  en: 8
  zh: 9
pinned: false
```

- [ ] **Step 3: 创建 `content/posts/0034-debugging-anr/en.mdx`**

```mdx
---chapter: the call---

It was 2:47 AM when the alert fired. Crashlytics painted the dashboard red.

---chapter: the trace---

Reading ANR traces is pattern recognition. The kernel dumps every thread.
```

- [ ] **Step 4: 创建 `content/posts/0034-debugging-anr/zh.mdx`**

```mdx
---chapter: 警报---

凌晨 2:47 警报响起。Crashlytics 把仪表盘染红。

---chapter: 追踪---

读 ANR trace 是一种模式识别。内核会 dump 出每一条线程。
```

- [ ] **Step 5: 写测试 `tests/lib/content.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { parsePostMeta, buildPostFromRawSources } from '@/lib/content';

describe('parsePostMeta', () => {
  it('parses meta.yaml content', () => {
    const yaml = `
slug: 0034-test
date: 2026-04-28
tags:
  - android
readingTime:
  en: 8
  zh: 9
`;
    const meta = parsePostMeta(yaml);
    expect(meta.slug).toBe('0034-test');
    expect(meta.date).toBe('2026-04-28');
    expect(meta.tags).toEqual(['android']);
    expect(meta.readingTime.en).toBe(8);
  });
});

describe('buildPostFromRawSources', () => {
  it('combines meta and per-language MDX sources', () => {
    const post = buildPostFromRawSources({
      metaYaml: 'slug: x\ndate: 2026-01-01\ntags: []\nreadingTime: { en: 1, zh: 1 }',
      enMdx: '---chapter: hi---\nhello',
      zhMdx: '---chapter: 你好---\n大家好',
    });
    expect(post.meta.slug).toBe('x');
    expect(post.chapters.en[0].title).toBe('hi');
    expect(post.chapters.en[0].body).toBe('hello');
    expect(post.chapters.zh[0].title).toBe('你好');
    expect(post.chapters.zh[0].body).toBe('大家好');
  });

  it('throws when chapter counts differ between languages', () => {
    expect(() => buildPostFromRawSources({
      metaYaml: 'slug: x\ndate: 2026-01-01\ntags: []\nreadingTime: { en: 1, zh: 1 }',
      enMdx: '---chapter: a---\nA\n---chapter: b---\nB',
      zhMdx: '---chapter: a---\nA',
    })).toThrow(/chapter count/i);
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

```bash
npm run test:run -- tests/lib/content.test.ts
```

预期：失败（模块不存在）。

- [ ] **Step 7: 实现 `src/lib/content.ts`**

```ts
import { parse as parseYaml } from 'yaml';
import { parseChapters } from './chapters';
import type { Post, PostMeta } from '@/types';

export function parsePostMeta(yamlText: string): PostMeta {
  const data = parseYaml(yamlText);
  if (!data?.slug) throw new Error('meta.yaml: missing slug');
  if (!data?.date) throw new Error('meta.yaml: missing date');
  return {
    slug: String(data.slug),
    date: String(data.date),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: {
      en: Number(data.readingTime?.en ?? 0),
      zh: Number(data.readingTime?.zh ?? 0),
    },
    pinned: Boolean(data.pinned),
  };
}

export interface RawPostSources {
  metaYaml: string;
  enMdx: string;
  zhMdx: string;
}

export function buildPostFromRawSources(raw: RawPostSources): Post {
  const meta = parsePostMeta(raw.metaYaml);
  const en = parseChapters(raw.enMdx);
  const zh = parseChapters(raw.zhMdx);
  if (en.length !== zh.length) {
    throw new Error(`Chapter count mismatch for ${meta.slug}: en=${en.length}, zh=${zh.length}`);
  }
  return { meta, chapters: { en, zh } };
}

export async function loadAllPosts(): Promise<Post[]> {
  const metaModules = import.meta.glob('/content/posts/*/meta.yaml', { query: '?raw', import: 'default' });
  const enModules = import.meta.glob('/content/posts/*/en.mdx', { query: '?raw', import: 'default' });
  const zhModules = import.meta.glob('/content/posts/*/zh.mdx', { query: '?raw', import: 'default' });

  const slugFromPath = (p: string) => p.split('/').slice(-2, -1)[0];

  const slugs = [...new Set(Object.keys(metaModules).map(slugFromPath))];
  const posts: Post[] = [];

  for (const slug of slugs) {
    const metaKey = Object.keys(metaModules).find(k => slugFromPath(k) === slug)!;
    const enKey = Object.keys(enModules).find(k => slugFromPath(k) === slug);
    const zhKey = Object.keys(zhModules).find(k => slugFromPath(k) === slug);
    if (!enKey || !zhKey) {
      throw new Error(`Post ${slug}: missing en.mdx or zh.mdx`);
    }
    const [metaYaml, enMdx, zhMdx] = await Promise.all([
      metaModules[metaKey](), enModules[enKey](), zhModules[zhKey](),
    ]);
    posts.push(buildPostFromRawSources({
      metaYaml: metaYaml as string,
      enMdx: enMdx as string,
      zhMdx: zhMdx as string,
    }));
  }

  posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  return posts;
}
```

- [ ] **Step 8: 运行测试确认通过**

```bash
npm run test:run -- tests/lib/content.test.ts
```

预期：3 个测试全部通过。

- [ ] **Step 9: 提交**

```bash
git add -A
git commit -m "feat: add post meta parser and content loader"
```

---

## Phase 4: i18n 系统

### Task 7: i18n 字符串与 hook（TDD）

**Files:**
- Create: `src/i18n/en.json`, `src/i18n/zh.json`, `tests/hooks/useI18n.test.tsx`, `src/hooks/useI18n.ts`

- [ ] **Step 1: 写 `src/i18n/en.json`**

```json
{
  "nav.about": "/about",
  "panel.tags": "// tags",
  "panel.now": "// now",
  "now.work": "work:",
  "now.read": "read:",
  "now.build": "build:",
  "now.updated": "last updated",
  "posts.title": "// posts",
  "posts.sort": "sort",
  "posts.sort.newest": "newest ▾",
  "filter.label": "filtering by:",
  "filter.clear": "[ clear ]",
  "post.min": "min",
  "loadmore": "[ load 20 more... ]",
  "footer.copy": "© 2026 roger kwan",
  "count.entries": "— {n} entries",
  "count.match": "— {n} match",
  "badge.selected": "{n} SELECTED",
  "post.continue.desktop": "press ENTER or SPACE to continue",
  "post.continue.mobile": "▸ TAP to continue",
  "post.skip": "SKIP ▸▸",
  "post.chapter": "CH",
  "post.end": "◆ END_OF_TRANSMISSION ◆",
  "post.endNote": "// thanks for reading",
  "post.prev": "← prev",
  "post.next": "next →",
  "notfound.cmd": "bash: {path}: No such file or directory",
  "notfound.suggest": "did you mean:",
  "notfound.home": "[home]",
  "notfound.browse": "[browse]"
}
```

- [ ] **Step 2: 写 `src/i18n/zh.json`**（占位，实际文案后续由作者填）

```json
{
  "nav.about": "/关于",
  "panel.tags": "// 标签",
  "panel.now": "// 当下",
  "now.work": "工作：",
  "now.read": "在读：",
  "now.build": "在做：",
  "now.updated": "最后更新",
  "posts.title": "// 文章",
  "posts.sort": "排序",
  "posts.sort.newest": "最新 ▾",
  "filter.label": "筛选：",
  "filter.clear": "[ 清空 ]",
  "post.min": "分钟",
  "loadmore": "[ 加载更多... ]",
  "footer.copy": "© 2026 关沛廷",
  "count.entries": "— 共 {n} 篇",
  "count.match": "— {n} 篇匹配",
  "badge.selected": "已选 {n}",
  "post.continue.desktop": "按 回车 或 空格 继续",
  "post.continue.mobile": "▸ 点击继续",
  "post.skip": "跳过 ▸▸",
  "post.chapter": "第",
  "post.end": "◆ 传输完毕 ◆",
  "post.endNote": "// 感谢阅读",
  "post.prev": "← 上一篇",
  "post.next": "下一篇 →",
  "notfound.cmd": "bash: {path}: 没有这个文件或目录",
  "notfound.suggest": "你是不是想：",
  "notfound.home": "[首页]",
  "notfound.browse": "[浏览]"
}
```

- [ ] **Step 3: 写测试 `tests/hooks/useI18n.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useI18n, I18nProvider } from '@/hooks/useI18n';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

describe('useI18n', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to English', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.lang).toBe('en');
    expect(result.current.t('panel.tags')).toBe('// tags');
  });

  it('switches language and updates t()', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    act(() => result.current.setLang('zh'));
    expect(result.current.lang).toBe('zh');
    expect(result.current.t('panel.tags')).toBe('// 标签');
  });

  it('persists language to localStorage', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    act(() => result.current.setLang('zh'));
    expect(localStorage.getItem('blog.lang')).toBe('zh');
  });

  it('substitutes {n} variables', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('count.entries', { n: 47 })).toBe('— 47 entries');
  });

  it('falls back to key when string missing', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });
});
```

- [ ] **Step 4: 运行测试确认失败**

```bash
npm run test:run -- tests/hooks/useI18n.test.tsx
```

预期：失败（模块不存在）。

- [ ] **Step 5: 实现 `src/hooks/useI18n.ts`**

```ts
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '@/i18n/en.json';
import zh from '@/i18n/zh.json';
import type { Lang } from '@/types';

type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = { en, zh };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'blog.lang';

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'zh') return saved;
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('lang-switching');
      setTimeout(() => document.body.classList.remove('lang-switching'), 400);
    }
    setLangState(l);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const dict = DICTS[lang];
    let s = dict[key] ?? DICTS.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  }, [lang]);

  return React.createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
```

- [ ] **Step 6: 运行测试确认通过**

```bash
npm run test:run -- tests/hooks/useI18n.test.tsx
```

预期：5 个测试全部通过。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: add i18n hook and en/zh string dictionaries"
```

---

### Task 8: 语言切换器组件

**Files:**
- Create: `tests/components/LangSwitcher.test.tsx`, `src/components/LangSwitcher.tsx`

- [ ] **Step 1: 写测试 `tests/components/LangSwitcher.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangSwitcher } from '@/components/LangSwitcher';
import { I18nProvider, useI18n } from '@/hooks/useI18n';

function CurrentLang() {
  const { lang } = useI18n();
  return <span data-testid="lang">{lang}</span>;
}

describe('LangSwitcher', () => {
  it('renders both language pills with current highlighted', () => {
    render(
      <I18nProvider>
        <LangSwitcher />
      </I18nProvider>
    );
    expect(screen.getByText('EN')).toHaveClass('active');
    expect(screen.getByText('中文')).not.toHaveClass('active');
  });

  it('switches language on click', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LangSwitcher />
        <CurrentLang />
      </I18nProvider>
    );
    await user.click(screen.getByText('中文'));
    expect(screen.getByTestId('lang').textContent).toBe('zh');
  });
});
```

- [ ] **Step 2: 实现 `src/components/LangSwitcher.tsx`**

```tsx
import { useI18n } from '@/hooks/useI18n';
import type { Lang } from '@/types';
import './LangSwitcher.css';

export function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switcher">
      {(['en', 'zh'] as Lang[]).map(l => (
        <span
          key={l}
          className={`lang-pill ${lang === l ? 'active' : ''}`}
          onClick={() => setLang(l)}
        >
          {l === 'en' ? 'EN' : '中文'}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 写 `src/components/LangSwitcher.css`**

```css
.lang-switcher { display: flex; gap: 4px; }
.lang-pill {
  color: var(--fg-faint);
  border: 1px solid var(--green-line-soft);
  padding: 4px 9px;
  font-size: 10px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
  text-transform: uppercase;
  user-select: none;
}
.lang-pill:hover { color: var(--green); border-color: var(--green); }
.lang-pill.active {
  color: #000;
  background: var(--green);
  border-color: var(--green);
  font-weight: 700;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm run test:run -- tests/components/LangSwitcher.test.tsx
```

预期：2 个测试通过。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add language switcher component"
```

---

## Phase 5: 路由与布局壳

### Task 9: React Router 配置与路由占位页

**Files:**
- Modify: `src/App.tsx`
- Create: `src/routes/Home.tsx`, `src/routes/Post.tsx`, `src/routes/About.tsx`, `src/routes/NotFound.tsx`

- [ ] **Step 1: 写最简 `src/routes/Home.tsx`**

```tsx
export default function Home() {
  return <div data-testid="home">home</div>;
}
```

- [ ] **Step 2: 写最简 `src/routes/Post.tsx`**

```tsx
import { useParams } from 'react-router-dom';

export default function Post() {
  const { slug } = useParams();
  return <div data-testid="post">post: {slug}</div>;
}
```

- [ ] **Step 3: 写最简 `src/routes/About.tsx`**

```tsx
export default function About() {
  return <div data-testid="about">about</div>;
}
```

- [ ] **Step 4: 写最简 `src/routes/NotFound.tsx`**

```tsx
export default function NotFound() {
  return <div data-testid="notfound">404</div>;
}
```

- [ ] **Step 5: 改写 `src/App.tsx` 配置路由**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/hooks/useI18n';
import Home from '@/routes/Home';
import Post from '@/routes/Post';
import About from '@/routes/About';
import NotFound from '@/routes/NotFound';

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/:lang">
            <Route index element={<Home />} />
            <Route path="posts/:slug" element={<Post />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
```

- [ ] **Step 6: 启动 dev 验证路由**

```bash
npm run dev
```

访问：
- `http://localhost:5173/` → 重定向到 `/en` → 看到 "home"
- `http://localhost:5173/en/posts/foo` → 看到 "post: foo"
- `http://localhost:5173/en/about` → 看到 "about"
- `http://localhost:5173/en/garbage` → 看到 "404"

Ctrl-C 关闭。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: configure react router with i18n route prefix"
```

---

### Task 10: 顶栏组件（TopBar）

**Files:**
- Create: `tests/components/TopBar.test.tsx`, `src/components/TopBar.tsx`, `src/components/TopBar.css`

- [ ] **Step 1: 写测试 `tests/components/TopBar.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { I18nProvider } from '@/hooks/useI18n';

function setup(initialPath = '/en') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <I18nProvider>
        <TopBar />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('TopBar', () => {
  it('renders brand', () => {
    setup();
    expect(screen.getByText(/ROGER@BLOG/i)).toBeInTheDocument();
  });

  it('renders home and about nav links', () => {
    setup();
    expect(screen.getByText('~')).toBeInTheDocument();
    expect(screen.getByText('/about')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    setup();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 实现 `src/components/TopBar.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { LangSwitcher } from './LangSwitcher';
import './TopBar.css';

export function TopBar() {
  const { lang, t } = useI18n();
  const { pathname } = useLocation();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const isAbout = pathname.startsWith(`/${lang}/about`);
  return (
    <div className="topbar">
      <Link to={`/${lang}`} className="brand">
        <span className="dot" />ROGER@BLOG
      </Link>
      <nav className="topnav">
        <Link to={`/${lang}`} className={isHome ? 'active' : ''}>~</Link>
        <Link to={`/${lang}/about`} className={isAbout ? 'active' : ''}>{t('nav.about')}</Link>
      </nav>
      <LangSwitcher />
    </div>
  );
}
```

- [ ] **Step 3: 写 `src/components/TopBar.css`**

```css
.topbar {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  padding-top: max(14px, env(safe-area-inset-top));
  background: linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.8));
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--green-line);
  gap: 12px;
}
.brand {
  color: var(--green) !important;
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 13px;
  white-space: nowrap;
  border: none !important;
}
.brand:hover { background: transparent !important; color: var(--green) !important; }
.brand .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--green);
  border-radius: 50%;
  margin-right: 6px;
  box-shadow: 0 0 8px var(--green);
  animation: pulse 2s infinite;
}
@keyframes pulse { 50% { opacity: 0.4; } }
.topnav { display: flex; gap: 22px; flex: 1; justify-content: center; }
.topnav a {
  color: var(--fg-dim) !important;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border: none !important;
}
.topnav a:hover { color: var(--green) !important; background: transparent !important; }
.topnav a.active { color: var(--green) !important; border-bottom: 1px solid var(--green) !important; padding-bottom: 2px; }
@media (max-width: 800px) {
  .topbar { padding: 12px 12px; gap: 8px; flex-wrap: wrap; }
  .topnav { gap: 14px; flex: 0 1 auto; order: 3; width: 100%; justify-content: flex-start; padding-top: 4px; border-top: 1px dashed var(--green-line); margin-top: 4px; }
  .topnav a { font-size: 10px; }
}
```

- [ ] **Step 4: 运行测试**

```bash
npm run test:run -- tests/components/TopBar.test.tsx
```

预期：3 个测试通过。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add TopBar component with brand, nav, lang switcher"
```

---

## Phase 6: 首页

### Task 11: 标签筛选 hook（OR 逻辑 + URL 同步，TDD）

**Files:**
- Create: `tests/hooks/useTagFilter.test.tsx`, `src/hooks/useTagFilter.ts`

- [ ] **Step 1: 写测试 `tests/hooks/useTagFilter.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTagFilter } from '@/hooks/useTagFilter';
import React from 'react';

const wrapper = (initialPath = '/en') => ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, { initialEntries: [initialPath] }, children);

describe('useTagFilter', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    expect(result.current.selected).toEqual([]);
  });

  it('toggle adds and removes tags', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    act(() => result.current.toggle('android'));
    expect(result.current.selected).toEqual(['android']);
    act(() => result.current.toggle('debugging'));
    expect(result.current.selected).toEqual(['android', 'debugging']);
    act(() => result.current.toggle('android'));
    expect(result.current.selected).toEqual(['debugging']);
  });

  it('clear empties selection', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    act(() => { result.current.toggle('a'); result.current.toggle('b'); });
    act(() => result.current.clear());
    expect(result.current.selected).toEqual([]);
  });

  it('matches OR logic: post matches if it has ANY selected tag', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    act(() => { result.current.toggle('android'); result.current.toggle('career'); });
    expect(result.current.matches(['android'])).toBe(true);
    expect(result.current.matches(['career'])).toBe(true);
    expect(result.current.matches(['code'])).toBe(false);
    expect(result.current.matches([])).toBe(false);
  });

  it('empty selection matches everything', () => {
    const { result } = renderHook(() => useTagFilter(), { wrapper: wrapper() });
    expect(result.current.matches(['anything'])).toBe(true);
    expect(result.current.matches([])).toBe(true);
  });

  it('reads initial state from URL ?tags=', () => {
    const { result } = renderHook(() => useTagFilter(), {
      wrapper: wrapper('/en?tags=android,debugging'),
    });
    expect(result.current.selected).toEqual(['android', 'debugging']);
  });
});
```

- [ ] **Step 2: 实现 `src/hooks/useTagFilter.ts`**

注意：React Router v7 的 `setSearchParams` 是批处理异步的，不能把 `selected` 从 `searchParams.get` 派生。本地 useState 作为主源，useEffect 镜像到 URL。

```ts
import { useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseTagFilterResult {
  selected: string[];
  toggle: (tag: string) => void;
  clear: () => void;
  matches: (postTags: string[]) => boolean;
}

function parseTags(raw: string | null): string[] {
  return raw ? raw.split(',').filter(Boolean) : [];
}

export function useTagFilter(): UseTagFilterResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<string[]>(() => parseTags(searchParams.get('tags')));

  // Sync local state when URL changes externally (back/forward navigation).
  useEffect(() => {
    const fromUrl = parseTags(searchParams.get('tags'));
    setSelected(prev => (prev.join(',') === fromUrl.join(',') ? prev : fromUrl));
  }, [searchParams]);

  // Mirror local state to URL.
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const current = parseTags(params.get('tags'));
    if (current.join(',') === selected.join(',')) return;
    if (selected.length === 0) params.delete('tags');
    else params.set('tags', selected.join(','));
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggle = useCallback((tag: string) => {
    setSelected(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const matches = useCallback(
    (postTags: string[]) => {
      if (selected.length === 0) return true;
      return selected.some(t => postTags.includes(t));
    },
    [selected]
  );

  return { selected, toggle, clear, matches };
}
```

- [ ] **Step 3: 运行测试确认通过**

```bash
npm run test:run -- tests/hooks/useTagFilter.test.tsx
```

预期：6 个测试通过。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add useTagFilter hook with OR logic and URL sync"
```

---

### Task 12: 标签云组件（TagCloud）

**Files:**
- Create: `src/components/TagCloud.tsx`, `src/components/TagCloud.css`, `tests/components/TagCloud.test.tsx`

- [ ] **Step 1: 写测试 `tests/components/TagCloud.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagCloud } from '@/components/TagCloud';

const counts = { android: 18, debugging: 9, career: 5 };

describe('TagCloud', () => {
  it('renders all tags with counts', () => {
    render(<TagCloud counts={counts} selected={[]} onToggle={() => {}} />);
    expect(screen.getByText('#android')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('#career')).toBeInTheDocument();
  });

  it('marks selected tags as active', () => {
    render(<TagCloud counts={counts} selected={['android']} onToggle={() => {}} />);
    const pill = screen.getByText('#android').closest('.tag-pill');
    expect(pill).toHaveClass('selected');
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TagCloud counts={counts} selected={[]} onToggle={onToggle} />);
    await user.click(screen.getByText('#android'));
    expect(onToggle).toHaveBeenCalledWith('android');
  });
});
```

- [ ] **Step 2: 实现 `src/components/TagCloud.tsx`**

```tsx
import './TagCloud.css';

interface Props {
  counts: Record<string, number>;
  selected: string[];
  onToggle: (tag: string) => void;
}

export function TagCloud({ counts, selected, onToggle }: Props) {
  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <div className="tag-cloud">
      {tags.map(([tag, count]) => (
        <span
          key={tag}
          className={`tag-pill ${selected.includes(tag) ? 'selected' : ''}`}
          onClick={() => onToggle(tag)}
        >
          #{tag}<span className="count">{count}</span>
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 写 `src/components/TagCloud.css`**

```css
.tag-cloud { display: flex; flex-wrap: wrap; gap: 4px; }
.tag-pill {
  border: 1px solid var(--green-line-soft);
  color: var(--green-dim);
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  user-select: none;
  transition: all 0.12s;
}
.tag-pill:hover { border-color: var(--green); background: rgba(0,255,102,0.1); }
.tag-pill.selected {
  background: var(--green);
  color: #000;
  border-color: var(--green);
  font-weight: 700;
}
.tag-pill.selected .count { color: #003c1a; }
.tag-pill .count { color: var(--fg-faint); font-size: 9px; margin-left: 4px; }
```

- [ ] **Step 4: 运行测试**

```bash
npm run test:run -- tests/components/TagCloud.test.tsx
```

预期：3 个测试通过。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add TagCloud component"
```

---

### Task 13: NowPanel 数据 + 组件

**Files:**
- Create: `content/now.yaml`, `src/lib/now.ts`, `src/components/NowPanel.tsx`, `src/components/NowPanel.css`

- [ ] **Step 1: 创建 `content/now.yaml`**（作者维护的数据）

```yaml
work:
  en: "TikTok · android infra"
  zh: "TikTok · Android 基础架构"
read:
  en: "OS: Three Easy Pieces"
  zh: "《操作系统导论》"
build:
  en: "a side blog (this one)"
  zh: "一个业余博客（就是这个）"
lastUpdated: "2026-04-29"
```

- [ ] **Step 2: 实现 `src/lib/now.ts`**

```ts
import nowYaml from '/content/now.yaml?raw';
import { parse as parseYaml } from 'yaml';
import type { NowEntry } from '@/types';

export function loadNow(): NowEntry {
  const data = parseYaml(nowYaml);
  return data as NowEntry;
}
```

- [ ] **Step 3: 实现 `src/components/NowPanel.tsx`**

```tsx
import { useI18n } from '@/hooks/useI18n';
import { loadNow } from '@/lib/now';
import './NowPanel.css';

export function NowPanel() {
  const { lang, t } = useI18n();
  const now = loadNow();
  return (
    <div className="panel now-panel">
      <div className="panel-title">{t('panel.now')}</div>
      <div className="now-line"><span className="k">{t('now.work')}</span> {now.work[lang]}</div>
      <div className="now-line"><span className="k">{t('now.read')}</span> {now.read[lang]}</div>
      <div className="now-line"><span className="k">{t('now.build')}</span> {now.build[lang]}</div>
      <div className="now-updated">{t('now.updated')}: {now.lastUpdated}</div>
    </div>
  );
}
```

- [ ] **Step 4: 写 `src/components/NowPanel.css`**

```css
.panel {
  border: 1px solid var(--green-line);
  background: var(--green-bg-soft);
  padding: 12px 14px;
}
.panel-title {
  color: var(--fg-dim);
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--green-line);
}
.now-line { font-size: 11px; color: #aaa; line-height: 1.7; padding: 2px 0; }
.now-line .k { color: var(--fg-dim); font-size: 10px; }
.now-updated {
  font-size: 9px;
  color: var(--fg-faint);
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--green-line);
  letter-spacing: 1px;
}
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add NowPanel component with author-maintained yaml"
```

---

### Task 14: 已读状态 hook（TDD）

**Files:**
- Create: `tests/hooks/useReadStatus.test.tsx`, `src/hooks/useReadStatus.ts`

- [ ] **Step 1: 写测试 `tests/hooks/useReadStatus.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReadStatus } from '@/hooks/useReadStatus';

describe('useReadStatus', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useReadStatus());
    expect(result.current.isRead('0034')).toBe(false);
  });

  it('marks slug as read', () => {
    const { result } = renderHook(() => useReadStatus());
    act(() => result.current.markRead('0034'));
    expect(result.current.isRead('0034')).toBe(true);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useReadStatus());
    act(() => result.current.markRead('0034'));
    expect(localStorage.getItem('blog.read')).toContain('0034');
  });

  it('hydrates from localStorage on init', () => {
    localStorage.setItem('blog.read', JSON.stringify(['0034', '0033']));
    const { result } = renderHook(() => useReadStatus());
    expect(result.current.isRead('0034')).toBe(true);
    expect(result.current.isRead('0033')).toBe(true);
  });

  it('does not duplicate slugs', () => {
    const { result } = renderHook(() => useReadStatus());
    act(() => { result.current.markRead('0034'); result.current.markRead('0034'); });
    const stored = JSON.parse(localStorage.getItem('blog.read')!);
    expect(stored).toEqual(['0034']);
  });
});
```

- [ ] **Step 2: 实现 `src/hooks/useReadStatus.ts`**

```ts
import { useCallback, useState } from 'react';

const STORAGE_KEY = 'blog.read';

function load(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useReadStatus() {
  const [readSet, setReadSet] = useState<Set<string>>(() => new Set(load()));

  const isRead = useCallback((slug: string) => readSet.has(slug), [readSet]);

  const markRead = useCallback((slug: string) => {
    setReadSet(prev => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      }
      return next;
    });
  }, []);

  return { isRead, markRead };
}
```

- [ ] **Step 3: 运行测试**

```bash
npm run test:run -- tests/hooks/useReadStatus.test.tsx
```

预期：5 个测试通过。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add useReadStatus hook with localStorage persistence"
```

---

### Task 15: 文章列表组件（PostList）

**Files:**
- Create: `tests/components/PostList.test.tsx`, `src/components/PostList.tsx`, `src/components/PostList.css`

- [ ] **Step 1: 写测试 `tests/components/PostList.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostList } from '@/components/PostList';
import { I18nProvider } from '@/hooks/useI18n';
import type { PostSummary } from '@/types';

const summaries: PostSummary[] = [
  {
    meta: { slug: '0034', date: '2026-04-28', tags: ['android'], readingTime: { en: 8, zh: 9 } },
    title: { en: 'Debugging ANR', zh: '调试 ANR' },
  },
  {
    meta: { slug: '0033', date: '2026-04-19', tags: ['career'], readingTime: { en: 6, zh: 7 } },
    title: { en: 'Leaving Motiff', zh: '离开 Motiff' },
  },
];

function setup(readSlugs: string[] = []) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <PostList summaries={summaries} readSlugs={readSlugs} />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('PostList', () => {
  it('renders all posts', () => {
    setup();
    expect(screen.getByText('Debugging ANR')).toBeInTheDocument();
    expect(screen.getByText('Leaving Motiff')).toBeInTheDocument();
  });

  it('marks read posts with .read class', () => {
    setup(['0033']);
    const post = screen.getByText('Leaving Motiff').closest('.post');
    expect(post).toHaveClass('read');
  });

  it('renders empty state when no posts', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <PostList summaries={[]} readSlugs={[]} />
        </I18nProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText(/Debugging/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 实现 `src/components/PostList.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import type { PostSummary } from '@/types';
import './PostList.css';

interface Props {
  summaries: PostSummary[];
  readSlugs: string[];
}

export function PostList({ summaries, readSlugs }: Props) {
  const { lang, t } = useI18n();
  const readSet = new Set(readSlugs);
  return (
    <div className="post-list">
      {summaries.map(s => (
        <Link
          key={s.meta.slug}
          to={`/${lang}/posts/${s.meta.slug}`}
          className={`post ${readSet.has(s.meta.slug) ? 'read' : ''}`}
        >
          <div className="post-date">{s.meta.date.replace(/-/g, '.')}</div>
          <div>
            <div className="post-title">{s.title[lang]}</div>
            <div className="post-tags">{s.meta.tags.map(t => `#${t}`).join(' ')}</div>
          </div>
          <div className="meta-right">{s.meta.readingTime[lang]} {t('post.min')} · {s.meta.slug}</div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 写 `src/components/PostList.css`**

```css
.post-list { display: flex; flex-direction: column; }
.post {
  display: grid !important;
  grid-template-columns: 80px 1fr 80px;
  gap: 16px;
  padding: 14px 4px !important;
  border-bottom: 1px dashed var(--green-line) !important;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  align-items: center;
  text-decoration: none !important;
}
.post:hover { background: rgba(0,255,102,0.04) !important; }
.post.read .post-title::before { content: '✓ '; color: #2a6a2a; font-size: 11px; }
.post-date { color: var(--fg-faint); font-size: 10px; letter-spacing: 1px; }
.post-title { color: var(--green); font-size: 14px; font-weight: 500; }
.post-tags { color: var(--pink); font-size: 10px; margin-top: 2px; }
.meta-right { text-align: right; color: var(--fg-faint); font-size: 10px; }
@media (max-width: 600px) {
  .post { grid-template-columns: 60px 1fr; }
  .post .meta-right { display: none; }
}
```

- [ ] **Step 4: 运行测试**

```bash
npm run test:run -- tests/components/PostList.test.tsx
```

预期：3 个测试通过。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add PostList component"
```

---

### Task 16: Home 路由组装

**Files:**
- Modify: `src/routes/Home.tsx`
- Create: `src/routes/Home.css`

- [ ] **Step 1: 改写 `src/routes/Home.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { TagCloud } from '@/components/TagCloud';
import { NowPanel } from '@/components/NowPanel';
import { PostList } from '@/components/PostList';
import { useI18n } from '@/hooks/useI18n';
import { useTagFilter } from '@/hooks/useTagFilter';
import { useReadStatus } from '@/hooks/useReadStatus';
import { loadAllPosts } from '@/lib/content';
import type { Post, PostSummary } from '@/types';
import './Home.css';

export default function Home() {
  const { t, lang } = useI18n();
  const { selected, toggle, clear, matches } = useTagFilter();
  const { isRead } = useReadStatus();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => { loadAllPosts().then(setPosts); }, []);

  const summaries: PostSummary[] = posts.map(p => ({
    meta: p.meta,
    title: { en: p.chapters.en[0]?.title || p.meta.slug, zh: p.chapters.zh[0]?.title || p.meta.slug },
  }));

  const filtered = summaries.filter(s => matches(s.meta.tags));

  const tagCounts: Record<string, number> = {};
  summaries.forEach(s => s.meta.tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));

  const readSlugs = filtered.filter(s => isRead(s.meta.slug)).map(s => s.meta.slug);

  return (
    <>
      <TopBar />
      <div className="home-layout">
        <aside className="sidebar">
          <div className="panel">
            <div className="panel-title">
              <span>{t('panel.tags')}</span>
              {selected.length > 0 && <span className="badge">{t('badge.selected', { n: selected.length })}</span>}
            </div>
            <TagCloud counts={tagCounts} selected={selected} onToggle={toggle} />
          </div>
          <NowPanel />
        </aside>
        <main className="main">
          <h2>
            <span>{t('posts.title')} <span className="dim">{t(selected.length ? 'count.match' : 'count.entries', { n: filtered.length })}</span></span>
            <span className="dim">{t('posts.sort')}: <span style={{ color: 'var(--green)' }}>{t('posts.sort.newest')}</span></span>
          </h2>
          {selected.length > 0 && (
            <div className="filter-status">
              <span className="label">{t('filter.label')}</span>
              {selected.map(tag => <span key={tag} className="selected-tag">#{tag}</span>)}
              <span className="clear" onClick={clear}>{t('filter.clear')}</span>
            </div>
          )}
          <PostList summaries={filtered} readSlugs={readSlugs} />
        </main>
      </div>
      <footer>
        <span>{t('footer.copy')}</span> ·
        <a href="https://github.com" target="_blank" rel="noreferrer">github</a> ·
        <a href="/rss.xml">rss</a> ·
        <a href="https://twitter.com" target="_blank" rel="noreferrer">twitter</a>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: 写 `src/routes/Home.css`**

```css
.home-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 24px;
}
.sidebar { display: flex; flex-direction: column; gap: 16px; }
.panel-title { display: flex; justify-content: space-between; align-items: center; }
.panel-title .badge {
  color: var(--green);
  font-size: 9px;
  border: 1px solid var(--green);
  padding: 0 5px;
  letter-spacing: 1px;
}
.main h2 {
  color: var(--fg-dim);
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--green-line);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.main h2 .dim { color: var(--fg-faint); }
.filter-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 14px;
  background: rgba(0,255,102,0.05);
  border: 1px dashed var(--green-line-soft);
  font-size: 11px;
  flex-wrap: wrap;
}
.filter-status .label { color: var(--fg-dim); letter-spacing: 1px; text-transform: uppercase; font-size: 10px; }
.filter-status .selected-tag {
  color: var(--green);
  border: 1px solid var(--green);
  padding: 1px 6px;
  font-size: 10px;
}
.filter-status .clear {
  color: var(--pink);
  cursor: pointer;
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  border: 1px solid var(--green-line-soft);
  padding: 2px 8px;
  transition: all 0.15s;
}
.filter-status .clear:hover { border-color: var(--pink); background: rgba(255,102,204,0.08); }
footer {
  margin-top: 40px;
  padding: 24px;
  border-top: 1px dashed var(--green-line);
  color: var(--fg-faint);
  font-size: 10px;
  text-align: center;
  letter-spacing: 1px;
}
footer a { color: var(--green); margin: 0 8px; border: none; }
@media (max-width: 800px) {
  .home-layout { grid-template-columns: 1fr; padding: 16px; gap: 16px; }
}
```

- [ ] **Step 3: 启动 dev 验证**

```bash
npm run dev
```

打开 `http://localhost:5173/`，应该看到：
- 顶栏（品牌 + 导航 + 语言切换）
- 左侧 tags + now 面板
- 右侧文章列表（至少 1 篇示例文章）
- 点击 `#android` 标签 → 列表筛选 + URL 变为 `?tags=android`
- 点击 `[ EN ] [ 中文 ]` → 整页字符串切换 + glitch 闪烁

Ctrl-C 关闭。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: assemble Home route with sidebar, tags, post list, filter"
```

---

## Phase 7: 文章阅读页

### Task 17: 打字机 hook（TDD with fake timers）

**Files:**
- Create: `tests/hooks/useTypewriter.test.tsx`, `src/hooks/useTypewriter.ts`

- [ ] **Step 1: 写测试 `tests/hooks/useTypewriter.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from '@/hooks/useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with empty text', () => {
    const { result } = renderHook(() => useTypewriter('hello', { speedMs: 10, enabled: true }));
    expect(result.current.text).toBe('');
    expect(result.current.done).toBe(false);
  });

  it('types characters over time', async () => {
    const { result } = renderHook(() => useTypewriter('hi', { speedMs: 10, enabled: true }));
    await act(async () => { await vi.advanceTimersByTimeAsync(15); });
    expect(result.current.text.length).toBeGreaterThanOrEqual(1);
  });

  it('completes when all characters typed', async () => {
    const { result } = renderHook(() => useTypewriter('hi', { speedMs: 5, enabled: true }));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.text).toBe('hi');
    expect(result.current.done).toBe(true);
  });

  it('skip jumps to end immediately', async () => {
    const { result } = renderHook(() => useTypewriter('long text here', { speedMs: 10, enabled: true }));
    act(() => result.current.skip());
    expect(result.current.text).toBe('long text here');
    expect(result.current.done).toBe(true);
  });

  it('disabled returns full text immediately', () => {
    const { result } = renderHook(() => useTypewriter('hello', { speedMs: 10, enabled: false }));
    expect(result.current.text).toBe('hello');
    expect(result.current.done).toBe(true);
  });

  it('snaps to full target when target changes mid-run (lang switch)', async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useTypewriter(target, { speedMs: 5, enabled: true }),
      { initialProps: { target: 'hello there friend' } }
    );
    // partway through typing
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });
    // target changes (simulating lang switch)
    rerender({ target: '你好朋友' });
    expect(result.current.text).toBe('你好朋友');
    expect(result.current.done).toBe(true);
  });
});
```

- [ ] **Step 2: 实现 `src/hooks/useTypewriter.ts`**

```ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface Options {
  speedMs: number;
  enabled: boolean;
}

interface Result {
  text: string;
  done: boolean;
  skip: () => void;
}

function delayForChar(ch: string, base: number): number {
  if ('.!?。！？'.includes(ch)) return base * 20;
  if (',;，；'.includes(ch)) return base * 8;
  if (ch === '\n') return base * 5;
  return base;
}

export function useTypewriter(target: string, opts: Options): Result {
  const { speedMs, enabled } = opts;
  const [text, setText] = useState(enabled ? '' : target);
  const [done, setDone] = useState(!enabled);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setText(target);
      setDone(true);
      return;
    }
    // If target changes after we've already started typing once,
    // snap to the full new target instead of replaying. This handles
    // language switch mid-article: spec §8.4 says unlocked chapters
    // should swap instantly, not retype.
    if (startedRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setText(target);
      setDone(true);
      return;
    }
    startedRef.current = true;
    indexRef.current = 0;
    setText('');
    setDone(false);

    const tick = () => {
      const i = indexRef.current;
      if (i >= target.length) {
        setDone(true);
        return;
      }
      const ch = target[i];
      setText(target.slice(0, i + 1));
      indexRef.current = i + 1;
      timerRef.current = setTimeout(tick, delayForChar(ch, speedMs));
    };
    timerRef.current = setTimeout(tick, speedMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [target, speedMs, enabled]);

  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setText(target);
    setDone(true);
  }, [target]);

  return { text, done, skip };
}
```

- [ ] **Step 3: 运行测试**

```bash
npm run test:run -- tests/hooks/useTypewriter.test.tsx
```

预期：5 个测试通过。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add useTypewriter hook with skip and reduced-motion support"
```

---

### Task 18: ChapterReader 组件（渐进式解锁核心）

**Files:**
- Create: `src/components/ChapterReader.tsx`, `src/components/ChapterReader.css`, `tests/components/ChapterReader.test.tsx`

- [ ] **Step 1: 写测试 `tests/components/ChapterReader.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterReader } from '@/components/ChapterReader';
import { I18nProvider } from '@/hooks/useI18n';
import type { Chapter } from '@/types';

const chapters: Chapter[] = [
  { title: 'one', body: 'A.' },
  { title: 'two', body: 'B.' },
  { title: 'three', body: 'C.' },
];

function setup(props: Partial<React.ComponentProps<typeof ChapterReader>> = {}) {
  return render(
    <I18nProvider>
      <ChapterReader chapters={chapters} reduceMotion={true} onComplete={vi.fn()} {...props} />
    </I18nProvider>
  );
}

describe('ChapterReader (reduceMotion)', () => {
  it('shows all chapter titles when reduceMotion is true', () => {
    setup();
    expect(screen.getByText('// one')).toBeInTheDocument();
    expect(screen.getByText('// two')).toBeInTheDocument();
    expect(screen.getByText('// three')).toBeInTheDocument();
  });

  it('all chapter bodies present in DOM (for SEO/a11y)', () => {
    const { container } = setup();
    expect(container.textContent).toContain('A.');
    expect(container.textContent).toContain('B.');
    expect(container.textContent).toContain('C.');
  });

  it('calls onComplete when reduceMotion (immediate completion)', () => {
    const onComplete = vi.fn();
    setup({ onComplete });
    expect(onComplete).toHaveBeenCalled();
  });
});

describe('ChapterReader (interactive)', () => {
  it('only first chapter is visible initially', () => {
    render(
      <I18nProvider>
        <ChapterReader chapters={chapters} reduceMotion={false} onComplete={vi.fn()} />
      </I18nProvider>
    );
    const containers = document.querySelectorAll('.chapter');
    expect(containers[0]).not.toHaveClass('locked');
    expect(containers[1]).toHaveClass('locked');
    expect(containers[2]).toHaveClass('locked');
  });

  it('skip button unlocks all chapters and calls onComplete', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ChapterReader chapters={chapters} reduceMotion={false} onComplete={onComplete} />
      </I18nProvider>
    );
    await user.click(screen.getByText(/SKIP/i));
    const containers = document.querySelectorAll('.chapter');
    expect(containers[2]).not.toHaveClass('locked');
    expect(onComplete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 实现 `src/components/ChapterReader.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useTypewriter } from '@/hooks/useTypewriter';
import type { Chapter } from '@/types';
import './ChapterReader.css';

interface Props {
  chapters: Chapter[];
  reduceMotion: boolean;
  onComplete: () => void;
}

export function ChapterReader({ chapters, reduceMotion, onComplete }: Props) {
  const { t } = useI18n();
  const [unlockedIdx, setUnlockedIdx] = useState(reduceMotion ? chapters.length - 1 : 0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  useEffect(() => {
    if (reduceMotion) onComplete();
  }, [reduceMotion, onComplete]);

  const advance = useCallback(() => {
    setUnlockedIdx(i => {
      const next = Math.min(i + 1, chapters.length - 1);
      if (next === chapters.length - 1) onComplete();
      return next;
    });
  }, [chapters.length, onComplete]);

  const skipAll = useCallback(() => {
    setUnlockedIdx(chapters.length - 1);
    onComplete();
  }, [chapters.length, onComplete]);

  useEffect(() => {
    if (reduceMotion) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
      else if (e.key === 'Escape') { skipAll(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [advance, skipAll, reduceMotion]);

  return (
    <div className="chapter-reader">
      <div className="chapter-topbar">
        <span className="progress">{t('post.chapter')} {Math.min(unlockedIdx + 1, chapters.length)} / {chapters.length}</span>
        {!reduceMotion && unlockedIdx < chapters.length - 1 && (
          <span className="skip-btn" onClick={skipAll}>{t('post.skip')}</span>
        )}
      </div>
      {chapters.map((ch, i) => (
        <ChapterBlock
          key={i}
          chapter={ch}
          locked={!reduceMotion && i > unlockedIdx}
          active={!reduceMotion && i === unlockedIdx}
          isLast={i === chapters.length - 1}
          showContinue={!reduceMotion && i === unlockedIdx && i < chapters.length - 1}
          isMobile={isMobile}
          onContinue={advance}
        />
      ))}
    </div>
  );
}

interface ChapterBlockProps {
  chapter: Chapter;
  locked: boolean;
  active: boolean;
  isLast: boolean;
  showContinue: boolean;
  isMobile: boolean;
  onContinue: () => void;
}

function ChapterBlock({ chapter, locked, active, showContinue, isMobile, onContinue }: ChapterBlockProps) {
  const { t } = useI18n();
  const { text, done } = useTypewriter(chapter.body, { speedMs: 10, enabled: active && !locked });
  const display = locked ? chapter.body : (active ? text : chapter.body);
  return (
    <div className={`chapter ${locked ? 'locked' : ''}`}>
      <div className="chapter-title">// {chapter.title}</div>
      <pre className="chapter-body">{display}</pre>
      {showContinue && done && (
        <div className="continue-prompt" onClick={onContinue}>
          {isMobile ? t('post.continue.mobile') : t('post.continue.desktop')}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 写 `src/components/ChapterReader.css`**

```css
.chapter-reader { max-width: 720px; margin: 0 auto; padding: 32px 20px 80px; }
.chapter-topbar {
  position: sticky;
  top: 60px;
  display: flex;
  justify-content: space-between;
  z-index: 150;
  padding: 8px 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(4px);
  border-bottom: 1px dashed var(--green-line);
}
.progress {
  color: var(--fg-dim);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.skip-btn {
  color: var(--fg-dim);
  font-size: 10px;
  letter-spacing: 1.5px;
  cursor: pointer;
  padding: 4px 10px;
  border: 1px solid var(--green-line-soft);
  text-transform: uppercase;
  transition: all 0.15s;
}
.skip-btn:hover { color: var(--green); border-color: var(--green); }
.chapter { margin: 24px 0; }
.chapter-title {
  color: var(--fg-dim);
  font-size: 11px;
  letter-spacing: 1px;
  margin-bottom: 12px;
  text-transform: uppercase;
}
.chapter-body { white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: inherit; font-size: 14px; line-height: 1.7; }
.chapter.locked .chapter-title,
.chapter.locked .chapter-body {
  opacity: 0;
  pointer-events: none;
}
.continue-prompt {
  display: block;
  margin: 28px -20px;
  padding: 18px 20px;
  background: rgba(0, 255, 102, 0.04);
  border-top: 1px solid var(--green-line);
  border-bottom: 1px solid var(--green-line);
  color: var(--green);
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  text-align: center;
  letter-spacing: 1px;
  text-transform: uppercase;
  touch-action: manipulation;
}
.continue-prompt:active { background: rgba(0, 255, 102, 0.12); }
@media (prefers-reduced-motion: reduce) {
  .chapter.locked .chapter-title,
  .chapter.locked .chapter-body { opacity: 1; }
}
```

- [ ] **Step 4: 运行测试**

```bash
npm run test:run -- tests/components/ChapterReader.test.tsx
```

预期：5 个测试通过。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add ChapterReader with progressive unlock"
```

---

### Task 19: Post 路由组装（含 prev/next）

**Files:**
- Modify: `src/routes/Post.tsx`
- Create: `src/routes/Post.css`

- [ ] **Step 1: 改写 `src/routes/Post.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { ChapterReader } from '@/components/ChapterReader';
import { useI18n } from '@/hooks/useI18n';
import { useReadStatus } from '@/hooks/useReadStatus';
import { loadAllPosts } from '@/lib/content';
import type { Post } from '@/types';
import './Post.css';

export default function PostRoute() {
  const { slug } = useParams();
  const { lang, t } = useI18n();
  const { markRead } = useReadStatus();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { loadAllPosts().then(setPosts); }, []);

  if (posts === null) return <div className="loading">loading...</div>;

  const idx = posts.findIndex(p => p.meta.slug === slug);
  if (idx === -1) return <Navigate to={`/${lang}/404`} replace />;

  const post = posts[idx];
  const prev = posts[idx + 1];
  const next = posts[idx - 1];
  const chapters = post.chapters[lang];

  const onComplete = () => markRead(post.meta.slug);

  return (
    <>
      <TopBar />
      <ChapterReader chapters={chapters} reduceMotion={reduceMotion} onComplete={onComplete} />
      <div className="post-end">
        <div className="end-mark">{t('post.end')}</div>
        <div className="end-note">{t('post.endNote')}</div>
        <nav className="post-nav">
          {prev && <Link to={`/${lang}/posts/${prev.meta.slug}`} className="prev">{t('post.prev')}: {prev.chapters[lang][0]?.title}</Link>}
          {next && <Link to={`/${lang}/posts/${next.meta.slug}`} className="next">{next.chapters[lang][0]?.title} :{t('post.next')}</Link>}
        </nav>
      </div>
    </>
  );
}
```

- [ ] **Step 2: 写 `src/routes/Post.css`**

```css
.loading { padding: 60px 20px; color: var(--fg-dim); text-align: center; font-size: 12px; letter-spacing: 2px; }
.post-end {
  max-width: 720px;
  margin: 40px auto;
  padding: 32px 20px;
  text-align: center;
  border-top: 1px dashed var(--green-line);
}
.end-mark { color: var(--green); font-size: 13px; letter-spacing: 3px; padding: 12px 0; }
.end-note { color: var(--fg-faint); font-size: 11px; }
.post-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  font-size: 12px;
  flex-wrap: wrap;
  gap: 12px;
}
.post-nav .prev, .post-nav .next { color: var(--green); border: none; }
```

- [ ] **Step 3: dev 验证**

```bash
npm run dev
```

访问 `http://localhost:5173/en/posts/0034-debugging-anr`：
- 看到 TopBar
- 看到 chapter-topbar 显示 `CH 1 / 2` 和 `SKIP ▸▸`
- 第一章标题和正文以打字机效果出现
- 章末出现绿色 `press ENTER or SPACE to continue` 提示
- 按 Enter → 第二章解锁开始打字
- 全部完成后看到 `◆ END_OF_TRANSMISSION ◆`
- 切换语言 → 整篇文章变中文版本

Ctrl-C 关闭。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: assemble Post route with chapter reader and prev/next nav"
```

---

## Phase 8: About 与 404

### Task 20: About 页面

**Files:**
- Modify: `src/routes/About.tsx`
- Create: `content/about.yaml`, `src/routes/About.css`

- [ ] **Step 1: 创建 `content/about.yaml`**

```yaml
en: |
  $ cat about.md

  > roger kwan — android engineer @ tiktok.

  Previously: motiff (design tool), paraflow, hulu.
  BUPT '15.

  reach me: github.com/12og3r
zh: |
  $ cat about.md

  > 关沛廷 — 字节跳动 Android 工程师

  此前：Motiff（设计工具）、Paraflow、Hulu。
  北邮 '15 届毕业。

  联系方式：github.com/12og3r
```

- [ ] **Step 2: 改写 `src/routes/About.tsx`**

```tsx
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/hooks/useI18n';
import aboutYaml from '/content/about.yaml?raw';
import { parse as parseYaml } from 'yaml';
import './About.css';

const ABOUT = parseYaml(aboutYaml) as { en: string; zh: string };

export default function About() {
  const { lang } = useI18n();
  return (
    <>
      <TopBar />
      <main className="about">
        <pre>{ABOUT[lang]}</pre>
      </main>
    </>
  );
}
```

- [ ] **Step 3: 写 `src/routes/About.css`**

```css
.about {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px;
}
.about pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.8;
  color: var(--fg);
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add About route with yaml-driven bilingual content"
```

---

### Task 21: 404 页面

**Files:**
- Modify: `src/routes/NotFound.tsx`
- Create: `src/routes/NotFound.css`

- [ ] **Step 1: 改写 `src/routes/NotFound.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/hooks/useI18n';
import './NotFound.css';

export default function NotFound() {
  const { pathname } = useLocation();
  const { lang, t } = useI18n();
  return (
    <>
      <TopBar />
      <main className="notfound">
        <pre className="cmd">{t('notfound.cmd', { path: pathname })}</pre>
        <div className="suggest">{t('notfound.suggest')}</div>
        <ul>
          <li><Link to={`/${lang}`}>$ cd ~ &nbsp;&nbsp;{t('notfound.home')}</Link></li>
          <li><Link to={`/${lang}`}>$ ls posts/ &nbsp;&nbsp;{t('notfound.browse')}</Link></li>
        </ul>
      </main>
    </>
  );
}
```

- [ ] **Step 2: 写 `src/routes/NotFound.css`**

```css
.notfound {
  max-width: 720px;
  margin: 0 auto;
  padding: 60px 24px;
}
.notfound .cmd {
  color: var(--pink);
  font-family: inherit;
  font-size: 13px;
  margin: 0 0 24px;
}
.notfound .suggest {
  color: var(--fg-dim);
  font-size: 11px;
  letter-spacing: 1px;
  margin-bottom: 12px;
  text-transform: uppercase;
}
.notfound ul { list-style: none; padding: 0; }
.notfound li { padding: 4px 0; }
.notfound li a { font-size: 13px; }
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add 404 page in terminal style"
```

---

## Phase 9: 构建产出（RSS / sitemap）

### Task 22: RSS feed 生成器（pure function, TDD）

**Files:**
- Create: `tests/lib/rss.test.ts`, `src/lib/rss.ts`

- [ ] **Step 1: 写测试 `tests/lib/rss.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildRssXml } from '@/lib/rss';
import type { Post } from '@/types';

const samplePost: Post = {
  meta: {
    slug: '0034',
    date: '2026-04-28',
    tags: ['android'],
    readingTime: { en: 8, zh: 9 },
  },
  chapters: {
    en: [{ title: 'the call', body: 'It was 2:47 AM.' }],
    zh: [{ title: '警报', body: '凌晨 2:47。' }],
  },
};

describe('buildRssXml', () => {
  it('produces valid RSS 2.0 root element', () => {
    const xml = buildRssXml({ posts: [samplePost], lang: 'en', siteUrl: 'https://example.com' });
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('</rss>');
  });

  it('includes one item per post with title from first chapter', () => {
    const xml = buildRssXml({ posts: [samplePost], lang: 'en', siteUrl: 'https://example.com' });
    expect(xml).toContain('<item>');
    expect(xml).toContain('<title>the call</title>');
    expect(xml).toContain('https://example.com/en/posts/0034');
  });

  it('uses zh chapters when lang=zh', () => {
    const xml = buildRssXml({ posts: [samplePost], lang: 'zh', siteUrl: 'https://example.com' });
    expect(xml).toContain('<title>警报</title>');
    expect(xml).toContain('/zh/posts/0034');
  });

  it('escapes special XML chars in titles and bodies', () => {
    const post: Post = { ...samplePost, chapters: { en: [{ title: 'A & B', body: '<script>x</script>' }], zh: samplePost.chapters.zh } };
    const xml = buildRssXml({ posts: [post], lang: 'en', siteUrl: 'https://example.com' });
    expect(xml).toContain('A &amp; B');
    expect(xml).not.toContain('<script>');
  });
});
```

- [ ] **Step 2: 实现 `src/lib/rss.ts`**

```ts
import type { Post, Lang } from '@/types';

interface RssOptions {
  posts: Post[];
  lang: Lang;
  siteUrl: string;
  siteTitle?: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildRssXml({ posts, lang, siteUrl, siteTitle = 'roger@blog' }: RssOptions): string {
  const items = posts.map(p => {
    const chapter0 = p.chapters[lang][0];
    const title = chapter0?.title || p.meta.slug;
    const description = p.chapters[lang].map(c => c.body).join('\n\n');
    const url = `${siteUrl}/${lang}/posts/${p.meta.slug}`;
    const pubDate = new Date(p.meta.date).toUTCString();
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteTitle)}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>`;
}
```

- [ ] **Step 3: 运行测试**

```bash
npm run test:run -- tests/lib/rss.test.ts
```

预期：4 个测试通过。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add RSS XML builder"
```

---

### Task 23: 构建脚本（生成 RSS 和 sitemap）

**Files:**
- Create: `scripts/build-rss.ts`, `scripts/build-sitemap.ts`
- Modify: `package.json`

- [ ] **Step 1: 安装 tsx（脚本运行器）**

```bash
npm install -D tsx
```

- [ ] **Step 2: 写 `scripts/build-rss.ts`**

```ts
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildPostFromRawSources } from '../src/lib/content';
import { buildRssXml } from '../src/lib/rss';
import type { Lang } from '../src/types';

const SITE_URL = process.env.SITE_URL || 'https://example.com';
const POSTS_DIR = 'content/posts';
const OUT_DIR = 'dist';

const slugs = readdirSync(POSTS_DIR);
const posts = slugs.map(slug => buildPostFromRawSources({
  metaYaml: readFileSync(join(POSTS_DIR, slug, 'meta.yaml'), 'utf-8'),
  enMdx: readFileSync(join(POSTS_DIR, slug, 'en.mdx'), 'utf-8'),
  zhMdx: readFileSync(join(POSTS_DIR, slug, 'zh.mdx'), 'utf-8'),
}));

posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date));

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

(['en', 'zh'] as Lang[]).forEach(lang => {
  const xml = buildRssXml({ posts, lang, siteUrl: SITE_URL });
  const path = lang === 'en' ? `${OUT_DIR}/rss.xml` : `${OUT_DIR}/rss-${lang}.xml`;
  writeFileSync(path, xml);
  console.log(`[rss] wrote ${path}`);
});
```

- [ ] **Step 3: 写 `scripts/build-sitemap.ts`**

```ts
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = process.env.SITE_URL || 'https://example.com';
const POSTS_DIR = 'content/posts';

const slugs = readdirSync(POSTS_DIR);
const dates = slugs.map(slug => {
  const yaml = readFileSync(join(POSTS_DIR, slug, 'meta.yaml'), 'utf-8');
  const m = yaml.match(/^date:\s*(\S+)/m);
  return { slug, date: m ? m[1] : '2026-01-01' };
});

const langs = ['en', 'zh'];
const urls: string[] = [];
langs.forEach(l => {
  urls.push(`<url><loc>${SITE_URL}/${l}</loc></url>`);
  urls.push(`<url><loc>${SITE_URL}/${l}/about</loc></url>`);
  dates.forEach(({ slug, date }) => {
    urls.push(`<url><loc>${SITE_URL}/${l}/posts/${slug}</loc><lastmod>${date}</lastmod></url>`);
  });
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

writeFileSync('dist/sitemap.xml', xml);
console.log('[sitemap] wrote dist/sitemap.xml');
```

- [ ] **Step 4: 添加构建后脚本到 `package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build && npm run build:rss && npm run build:sitemap",
  "build:rss": "tsx scripts/build-rss.ts",
  "build:sitemap": "tsx scripts/build-sitemap.ts",
  "preview": "vite preview",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 5: 验证 build 通过**

```bash
npm run build
```

预期：`dist/rss.xml`、`dist/rss-zh.xml`、`dist/sitemap.xml` 都生成。`ls dist/` 看一下。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add RSS and sitemap build scripts"
```

---

## Phase 10: 部署与验收

### Task 24: 添加额外 sample 文章（验证多文章场景）

**Files:**
- Create: `content/posts/0033-on-binder-ipc/{meta.yaml,en.mdx,zh.mdx}`
- Create: `content/posts/0032-leaving-motiff/{meta.yaml,en.mdx,zh.mdx}`

- [ ] **Step 1: 创建 `content/posts/0033-on-binder-ipc/meta.yaml`**

```yaml
slug: 0033-on-binder-ipc
date: 2026-04-19
tags:
  - android
  - essay
readingTime:
  en: 12
  zh: 14
pinned: false
```

- [ ] **Step 2: 创建 `content/posts/0033-on-binder-ipc/en.mdx`**

```mdx
---chapter: the abstraction---

Binder is the IPC mechanism powering nearly everything on Android.

---chapter: the cost---

Every Binder transaction crosses a process boundary. That cost adds up.
```

- [ ] **Step 3: 创建 `content/posts/0033-on-binder-ipc/zh.mdx`**

```mdx
---chapter: 抽象---

Binder 是 Android 上几乎一切的 IPC 机制。

---chapter: 代价---

每次 Binder 调用都跨进程边界。这种代价会积累。
```

- [ ] **Step 4: 类似创建 `0032-leaving-motiff/{meta.yaml, en.mdx, zh.mdx}`**

`meta.yaml`:
```yaml
slug: 0032-leaving-motiff
date: 2026-04-02
tags:
  - career
readingTime:
  en: 6
  zh: 7
pinned: false
```

`en.mdx`:
```mdx
---chapter: the decision---

After two years at Motiff, I decided to leave.

---chapter: what's next---

Joining TikTok's android infrastructure team.
```

`zh.mdx`:
```mdx
---chapter: 决定---

在 Motiff 待了两年后，我决定离开。

---chapter: 下一站---

加入字节跳动的 Android 基础架构团队。
```

- [ ] **Step 5: 启动 dev 验证多文章**

```bash
npm run dev
```

打开首页，应该看到 3 篇文章列表。点击任一篇 → 进入 ChapterReader → prev/next 导航工作。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "content: add 2 additional sample posts"
```

---

### Task 25: 静态构建验证

**Files:**
- Modify: `vite.config.ts` (如需 base path)

- [ ] **Step 1: 运行 build 并预览**

```bash
npm run build
npm run preview
```

打开 `http://localhost:4173/`：
- 重定向到 `/en` 工作
- 首页加载正常
- 标签筛选工作
- 进入文章页 → ChapterReader 工作
- 切换语言工作
- `/rss.xml` 可访问（直接打开 `http://localhost:4173/rss.xml`）
- `/sitemap.xml` 可访问

Ctrl-C 关闭 preview。

- [ ] **Step 2: 检查 dist/ 体积**

```bash
du -sh dist/
ls -lah dist/assets/
```

预期：JS bundle gzipped < 200KB（不含字体）。如果超出，记录在开放问题里。

- [ ] **Step 3: 提交（无变更则跳过）**

如果上述步骤产生新文件或改动，commit；否则跳过。

---

### Task 26: 部署配置（Vercel / Netlify）

**Files:**
- Create: `vercel.json`（如部署到 Vercel） 或 `netlify.toml`（如 Netlify）

选其中一个，下面以 Vercel 为例：

- [ ] **Step 1: 创建 `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/((?!rss\\.xml|rss-zh\\.xml|sitemap\\.xml|assets/).*)", "destination": "/index.html" }
  ]
}
```

（这一步保证 SPA 路由的所有 `/en/...`、`/zh/...` 路径都能 fallback 到 `index.html`，但静态资源和 RSS / sitemap 仍直接服务。）

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "deploy: add vercel rewrite config for SPA routing"
```

- [ ] **Step 3: 部署 (manual)**

```bash
# 推送到 GitHub
git remote add origin git@github.com:12og3r/blog.git  # 或你的真实 URL
git push -u origin main
```

然后在 Vercel 控制台导入这个仓库，部署。这一步**用户手动操作**，agent 不要尝试调用 deploy CLI。

---

### Task 27: 验收清单

实现完成时，逐项核对（参照 spec 的 §13）：

- [ ] 桌面首页 Lighthouse Performance > 90
- [ ] 移动端首页布局正确，无横向滚动
- [ ] 标签 OR 筛选交互正常，URL 同步
- [ ] 至少 3 篇示例文章（中英双语）
- [ ] 文章页打字机效果工作正常，按 Enter / Space / 点击都能推进
- [ ] SKIP 按钮工作
- [ ] 已读状态持久化（手动验证：读完一篇 → 关闭浏览器 → 重新打开 → 列表显示 ✓ ）
- [ ] 语言切换在首页、文章页、关于页都生效
- [ ] 文章页中切换语言：已解锁内容瞬切，未解锁继续锁
- [ ] 系统设置「减少动效」时打字机被禁用，扫描线消失
- [ ] `/rss.xml` 内容正确
- [ ] `/sitemap.xml` 内容正确
- [ ] 部署到生产环境，HTTPS 工作
- [ ] Lighthouse SEO score > 95

---

## 附录：常用命令快速参考

```bash
# 开发
npm run dev              # 启动 dev server (port 5173)
npm run test             # 测试 watch 模式
npm run test:run         # 测试单次跑完

# 构建
npm run build            # 完整构建（含 RSS, sitemap）
npm run preview          # 预览构建产物 (port 4173)
npm run type-check       # 类型检查

# 调试单个测试
npm run test:run -- tests/path/file.test.ts
```

---

*End of plan.*
