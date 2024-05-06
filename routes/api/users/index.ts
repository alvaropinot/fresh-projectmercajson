import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { Handlers } from '$fresh/server.ts'
import algoliasearch from 'https://esm.sh/algoliasearch@4.23.3'

type Product = {
  id: string
  data: object
}

const PREFIX = 'Products'

const kv = await Deno.openKv()

// Use an API key with `browse` ACL
const client = algoliasearch('7UZJKL1DJ0', '9d8f2e39e90df472b4f2e559a116fe17')
const index = client.initIndex('products_prod_mad1_es')
// const index = client.initIndex('contacts');

// Search for "query string" in the index "contacts"
// index.search('query string').then(({ hits }) => {
//   console.log(hits)
// })

// Perform the same search, but only retrieve 50 results
// Return only the attributes "firstname" and "lastname"

export const getAll = async ({ kv, prefix = PREFIX } = {}) => {
  const entries = []

  for await (const res of kv.list({ prefix: [prefix] })) {
    entries.spush(res.value)
  }
  return entries
}

export const get = async ({ kv, prefix = PREFIX, key = '' } = {}) => {
  const entry = await kv.get([prefix, key])
  console.log(entry.key)
  console.log(entry.value)
  console.log(entry.versionstamp)
  return entry
}

export const set = async ({
  kv,
  prefix = PREFIX,
  key = '',
  data = {},
} = {}) => {
  const entry = await kv.set([prefix, key], data)

  return entry
}

export const setHit = async ({ hit = { id: 'jd' }, kv }) => {
  console.log('Writting', PREFIX, hit.id, hit)
  return await set({
    data: hit,
    key: hit.id,
    prefix: PREFIX,
    kv,
  }).catch(console.error)
}

export const setAll = async ({ hits = [], kv }) => {
  const results = await hits.map((h) => setHit({ h, kv }))

  return await Promise.all(results)
}

export const handler: Handlers<Product | null> = {
  async GET(_req, _ctx) {
    const products = []
    for await (const res of kv.list({ prefix: [PREFIX] })) {
      products.push(res.value)
    }
    const { hits } = await index
      .search('', {
        // attributesToRetrieve: ['firstname', 'lastname'],
        hitsPerPage: 9000,
      })
      .then(async function waitAlgo(response) {
        console.log(JSON.stringify(response, null, 2))

        const products = await setAll({ hits: response.hits, kv })
        console.log(products)
        const productsDB = await getAll({ kv, prefix: PREFIX })

        console.log(productsDB)
        return response
      })

    return new Response(JSON.stringify(hits), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
  async POST(req, _ctx) {
    const product = (await req.json()) as Product
    // const productKey = [PREFIX, product.id, product.data]
    const ok = await kv.atomic().set(PREFIX, product.id, product.data).commit()
    if (!ok) throw new Error('Something went wrong.')
    return new Response(JSON.stringify(product))
  },
}
