import { Handlers } from '$fresh/server.ts'

type User = {
  id: string
  name: string
}

const kv = await Deno.openKv()

export const handler: Handlers<User | null> = {
  async GET(_req, _ctx) {
    const users = []
    for await (const res of kv.list({ prefix: ['user'] })) {
      users.push(res.value)
    }
    return new Response(JSON.stringify(users))
  },
  async POST(req, _ctx) {
    const user = (await req.json()) as User
    const userKey = ['user', user.id]
    const ok = await kv.atomic().set(userKey, user).commit()
    if (!ok) throw new Error('Something went wrong.')
    return new Response(JSON.stringify(user))
  },
}
