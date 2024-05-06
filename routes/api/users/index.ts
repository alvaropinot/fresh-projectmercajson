import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { Handlers } from '$fresh/server.ts'
import algoliasearch from 'https://esm.sh/algoliasearch@4.23.3'

type User = {
  id: string
  name: string
}

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

export const handler: Handlers<User | null> = {
  async GET(_req, _ctx) {
    // const users = []
    // for await (const res of kv.list({ prefix: ['user'] })) {
    //   users.push(res.value)
    // }
    const { hits } = await index.search('', {
      // attributesToRetrieve: ['firstname', 'lastname'],
      hitsPerPage: 9000,
    })
    // .then((response) => {
    //   // console.log('hits')
    //   console.log(JSON.stringify(response, null, 2))
    // })
    return new Response(JSON.stringify(hits))
  },
  async POST(req, _ctx) {
    const user = (await req.json()) as User
    const userKey = ['user', user.id]
    const ok = await kv.atomic().set(userKey, user).commit()
    if (!ok) throw new Error('Something went wrong.')
    return new Response(JSON.stringify(user))
  },
}
