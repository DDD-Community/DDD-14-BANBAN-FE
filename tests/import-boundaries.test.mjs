import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { ESLint } from 'eslint'
import tseslint from 'typescript-eslint'

test('import boundaries enforce architecture for aliases and relative paths', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'banban-imports-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const files = [
    'src/routes/index.tsx',
    'src/routes/__root.tsx',
    'src/shared/lib/value.ts',
    'src/features/first/component.ts',
    'src/features/first/internal.ts',
    'src/features/second/internal.ts',
    'src/features/second/index.ts',
    'src/features/second/public.ts',
    'src/router.tsx',
    'src/routeTree.gen.ts',
  ]
  for (const file of files) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await writeFile(path.join(root, file), 'export const value = 1\n')
  }
  await writeFile(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }),
  )
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: fileURLToPath(new URL('../eslint.config.mjs', import.meta.url)),
    overrideConfig: [
      tseslint.configs.disableTypeChecked,
      {
        settings: {
          'boundaries/root-path': root,
          'import/resolver': { typescript: { project: path.join(root, 'tsconfig.json') } },
        },
      },
    ],
  })
  const cases = [
    ['src/routes/index.tsx', "import '@/features/first/internal'", true],
    ['src/routes/index.tsx', "import '@/shared/lib/value'", true],
    ['src/routes/__root.tsx', "import type { RouterContext } from '@/router'", true],
    ['src/shared/lib/value.ts', "import '@/features/first/internal'", false],
    ['src/shared/lib/value.ts', "import '../../features/first/internal'", false],
    ['src/shared/lib/value.ts', "import '@/routes/index'", false],
    ['src/shared/lib/value.ts', "import '@/router'", false],
    ['src/features/first/component.ts', "import '@/shared/lib/value'", true],
    ['src/features/first/component.ts', "import './internal'", true],
    ['src/features/first/component.ts', "import '@/features/first/internal'", true],
    ['src/features/first/component.ts', "import '@/routes/index'", false],
    ['src/features/first/component.ts', "import '../../routes/index'", false],
    ['src/features/first/component.ts', "import '@/router'", false],
    ['src/features/first/component.ts', "import '@/routeTree.gen'", false],
    ['src/features/first/component.ts', "import '@/features/second/internal'", false],
    ['src/features/first/component.ts', "import '../second/internal'", false],
    ['src/features/first/component.ts', "import '@/features/second'", true],
    ['src/features/first/component.ts', "import '../second/index'", true],
    ['src/features/first/component.ts', "import '@/features/second/public'", true],
    [
      'src/features/first/component.ts',
      "import type { Value } from '@/features/second/internal'",
      false,
    ],
    ['src/features/first/component.ts', "export { value } from '../second/internal'", false],
    ['src/features/first/component.ts', "export * from '../second/internal'", false],
    ['src/features/first/component.ts', "void import('@/features/second/internal')", false],
    ['src/features/first/component.ts', "void import('@/features/second/public')", true],
    ['src/features/first/component.ts', "import { useState } from 'react'", true],
  ]
  for (const [file, code, allowed] of cases) {
    await t.test(`${allowed ? 'allow' : 'reject'} ${file}: ${code}`, async () => {
      const [result] = await eslint.lintText(code, { filePath: path.join(root, file) })
      assert(!result.messages.some((message) => message.fatal), JSON.stringify(result.messages))
      const violations = result.messages.filter(
        (message) => message.ruleId === 'boundaries/dependencies',
      )
      assert.equal(violations.length, allowed ? 0 : 1, JSON.stringify(result.messages))
    })
  }
})
