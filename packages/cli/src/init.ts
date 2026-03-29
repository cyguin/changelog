import {
  intro,
  outro,
  text,
  select,
  confirm,
  isCancel,
} from '@clack/prompts'
import fs from 'node:fs'
import path from 'node:path'

type Adapter = 'sqlite' | 'postgres'

const SQLITE_MIGRATION = `-- Changelog entries
CREATE TABLE IF NOT EXISTS changelog_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  tags TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER
);

-- Read tracking
CREATE TABLE IF NOT EXISTS changelog_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  read_at INTEGER NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES changelog_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_published ON changelog_entries(published);
CREATE INDEX IF NOT EXISTS idx_entries_created ON changelog_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reads_user ON changelog_reads(user_id);
`

const POSTGRES_MIGRATION = `-- Changelog entries
CREATE TABLE IF NOT EXISTS changelog_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  tags TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Read tracking
CREATE TABLE IF NOT EXISTS changelog_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (entry_id) REFERENCES changelog_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_published ON changelog_entries(published);
CREATE INDEX IF NOT EXISTS idx_entries_created ON changelog_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reads_user ON changelog_reads(user_id);
`

function sqliteAdapterConfig(dbPath: string) {
  return {
    adapterImport: "import { changelogAdapter } from '@cyguin/changelog/adapters/sqlite'",
    adapterInit: `const changelogAdapter = createSqliteAdapter('${dbPath}')`,
  }
}

function postgresAdapterConfig() {
  return {
    adapterImport: "import { changelogAdapter } from '@cyguin/changelog/adapters/postgres'",
    adapterInit: `const changelogAdapter = createPostgresAdapter(process.env.DATABASE_URL!)`,
  }
}

function writeFileAtomic(filePath: string, content: string): boolean {
  if (fs.existsSync(filePath)) {
    console.warn(`⚠  Skipped — already exists: ${filePath}`)
    return false
  }
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, content, 'utf-8')
  return true
}

export async function init(): Promise<void> {
  intro('Welcome to @cyguin/changelog — setting up your project')

  const adapter = (await select({
    message: 'Which database adapter?',
    options: [
      { value: 'sqlite', label: 'SQLite' },
      { value: 'postgres', label: 'PostgreSQL' },
    ],
  })) as Adapter

  if (isCancel(adapter)) {
    outro('Setup cancelled.')
    return
  }

  const dbPath =
    adapter === 'sqlite'
      ? ((await text({
          message: 'Database file path?',
          placeholder: './changelog.db',
          defaultValue: './changelog.db',
        })) as string)
      : 'postgres://user:pass@localhost:5432/mydb'

  if (isCancel(dbPath)) {
    outro('Setup cancelled.')
    return
  }

  const adminToken = (await text({
    message: 'Admin token (used for X-Changelog-Token header)?',
    placeholder: 'cyguin-changelog-admin-123',
    defaultValue: `cyguin-changelog-admin-${Math.random().toString(36).slice(2, 10)}`,
  })) as string

  if (isCancel(adminToken)) {
    outro('Setup cancelled.')
    return
  }

  const routesDir = (await text({
    message: 'Routes directory?',
    placeholder: 'app/api/changelog',
    defaultValue: 'app/api/changelog',
  })) as string

  if (isCancel(routesDir)) {
    outro('Setup cancelled.')
    return
  }

  const runMigration = (await confirm({
    message: `Run migration now? (writes migrations/001_changelog.sql)`,
    initialValue: true,
  })) as boolean

  if (isCancel(runMigration)) {
    outro('Setup cancelled.')
    return
  }

  const adapterConfig =
    adapter === 'sqlite'
      ? sqliteAdapterConfig(dbPath)
      : postgresAdapterConfig()

  const { listAndCreateRoute, singleEntryRoute, readRoute, adapterInitModule } =
    await import('./templates/routes.js')

  const baseConfig = {
    adapterImport: adapterConfig.adapterImport,
    adapterInit: adapterConfig.adapterInit,
  }

  const routeFiles = [
    { file: `${routesDir}/route.ts`, content: listAndCreateRoute(baseConfig) },
    {
      file: `${routesDir}/[id]/route.ts`,
      content: singleEntryRoute(baseConfig),
    },
    { file: `${routesDir}/read/route.ts`, content: readRoute(baseConfig) },
    {
      file: 'lib/changelog.ts',
      content: adapterInitModule(baseConfig),
    },
  ]

  const envFile = '.env.local'
  const envLine = `CHANGELOG_ADMIN_TOKEN=${adminToken}`
  const migrationFile = 'migrations/001_changelog.sql'
  const migrationContent = adapter === 'sqlite' ? SQLITE_MIGRATION : POSTGRES_MIGRATION

  console.log('')
  console.log('📁 Creating files…')

  let written = 0
  for (const { file, content } of routeFiles) {
    if (writeFileAtomic(file, content)) {
      console.log(`  ✓ ${file}`)
      written++
    }
  }

  if (fs.existsSync(envFile)) {
    const existing = fs.readFileSync(envFile, 'utf-8')
    if (existing.includes('CHANGELOG_ADMIN_TOKEN=')) {
      console.warn(`⚠  Skipped — .env.local already has CHANGELOG_ADMIN_TOKEN`)
    } else {
      fs.appendFileSync(envFile, `\n${envLine}\n`, 'utf-8')
      console.log(`  ✓ ${envFile} (appended CHANGELOG_ADMIN_TOKEN)`)
      written++
    }
  } else {
    fs.writeFileSync(envFile, `${envLine}\n`, 'utf-8')
    console.log(`  ✓ ${envFile}`)
    written++
  }

  if (runMigration) {
    if (writeFileAtomic(migrationFile, migrationContent)) {
      console.log(`  ✓ ${migrationFile}`)
      written++
    }
  }

  console.log('')
  if (written > 0) {
    outro(`Done! ${written} file(s) created.`)
  } else {
    outro('No new files were created (all targets already exist).')
  }
}
