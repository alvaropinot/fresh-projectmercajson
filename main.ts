/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import '$std/dotenv/load.ts'

import { start } from '$fresh/server.ts'
import manifest from './fresh.gen.ts'
import config from './fresh.config.ts'

Deno.cron('Log a message', { minute: { every: 5 } }, () => {
  console.log('This will print once an hour.')
})

await start(manifest, config)
