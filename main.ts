/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import '$std/dotenv/load.ts'
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import algoliasearch from 'https://esm.sh/algoliasearch@4.23.3'

import { start } from '$fresh/server.ts'
import manifest from './fresh.gen.ts'
import config from './fresh.config.ts'
type Product = {
  id: string
  name: string
}
const kv = await Deno.openKv()

const set = async ({
  kv = kv,
  prefix = 'Products',
  key = '',
  data = {},
} = {}) => {
  const entry = await kv.set([prefix, key], data)

  return entry
}
const get = async ({ kv, prefix = 'Products', key = '' } = {}) => {
  const entry = await kv.get([prefix, key])
  console.log(entry.key)
  console.log(entry.value)
  console.log(entry.versionstamp)
  return entry
}

const getAll = async ({ kv, prefix = 'Products' } = {}) => {
  const products = []

  for await (const res of kv.list({ prefix: [prefix] })) {
    products.spush(res.value)
  }
  return products
}

const setHit = async (hit = { id: 'jd' }) => {
  console.log('Writting', hit)
  return await set({ data: hit, key: hit.id, prefix: 'Products' }).catch(
    console.error
  )
}

const setAll = async (hits = []) => {
  const results = await hits.map(setHit)

  return await Promise.all(results)
}

Deno.cron('Log a message', { minutes: { every: 1 } }, async () => {
  // Use an API key with `browse` ACL
  const client = algoliasearch('7UZJKL1DJ0', '9d8f2e39e90df472b4f2e559a116fe17')
  const index = client.initIndex('products_prod_mad1_es')

  const { hits } = await index.search('', {
    hitsPerPage: 9000,
  })
  // console.log(JSON.stringify(hits), null, 2)
  console.log('Products')
  // console.log(JSON.stringify(get({ kv }), null, 2))
  const products = await setAll(hits)
  console.log(products)
})
console.log('Products')
console.log(JSON.stringify(getAll({ kv }), null, 2))

await start(manifest, config)
