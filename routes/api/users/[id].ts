import { Handlers, PageProps } from '$fresh/server.ts'
import Error404 from '../../_404.tsx'
import { get } from './index.ts'

type Product = {
  id: string
  // name: string
  // ...rest
}

const kv = await Deno.openKv()

export const handler: Handlers<Product | null> = {
  async GET(_req, ctx) {
    const id = ctx.params.id
    const product = get({ kv, key: id })
    return new Response(JSON.stringify(product))
  },
  async DELETE(_req, ctx) {
    const id = ctx.params.id
    const userKey = ['user', id]
    const userRes = await kv.get(userKey)
    if (!userRes.value) return new Response(`no user with id ${id} found`)
    const ok = await kv.atomic().check(userRes).delete(userKey).commit()
    if (!ok) throw new Error('Something went wrong.')
    return new Response(`user ${id} deleted`)
  },
  async PUT(req, ctx) {
    const id = ctx.params.id
    const user = (await req.json()) as User
    const userKey = ['user', id]
    const userRes = await kv.get(userKey)
    if (!userRes.value) return new Response(`no user with id ${id} found`)
    const ok = await kv.atomic().check(userRes).set(userKey, user).commit()
    if (!ok) throw new Error('Something went wrong.')
    return new Response(JSON.stringify(user))
  },
}
