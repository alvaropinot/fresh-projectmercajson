import { Handlers, PageProps } from '$fresh/server.ts'
import Error404 from '../../_404.tsx'

type User = {
  id: string
  name: string
}

const kv = await Deno.openKv()

export const handler: Handlers<User | null> = {
  async GET(_req, ctx) {
    // const id = ctx.params.id
    // // const user = { id: 2, name: 'foo' }
    // const userKey = ['user', id]
    // // const userRes = await kv.get(userKey)
    // // if (!userRes.value) return new Response(`no user with id ${id} found`)
    // const ok = await kv.atomic().set(userKey, user).commit()
    // if (!ok) throw new Error('Something went wrong.')
    // return new Response(JSON.stringify(user))
    const id = ctx.params.id
    const key = ['user', id]
    const user = (await kv.get<User>(key)).value!
    return new Response(JSON.stringify(user))
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
