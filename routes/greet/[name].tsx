// import { PageProps } from "$fresh/server.ts";

// export default function Greet(props: PageProps) {
//   return <div>Hello {props.params.name}</div>;
// }

interface Project {
  name: string
  stars: number
}

export const handler: Handlers<Project> = {
  async GET(_req, ctx) {
    const project = await db.projects.findOne({ id: ctx.params.id })
    if (!project) {
      return ctx.renderNotFound({
        message: 'Project does not exist',
      })
    }
    return ctx.render(project)
  },
}

export default function ProjectPage(props: PageProps<Project>) {
  return (
    <div>
      <h1>{props.data.name}</h1>
      <p>{props.data.stars} stars</p>
    </div>
  )
}
