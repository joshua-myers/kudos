import { Kudo as IKudo, Profile } from '@prisma/client'
import { json, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Kudo } from '~/components/kudo'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel'
import { requireUserId } from '~/utils/auth.server'
import { getFilteredKudos } from '~/utils/kudos.server'
import { getOtherUsers } from '~/utils/user.server'

interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const users = await getOtherUsers(userId)
  const kudos = await getFilteredKudos(userId, {}, {})
  return json({ users, kudos })
}

export default function Home() {
  const { users, kudos } = useLoaderData()
  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} />
        <div className="flex-1 flex flex-col">
          {/* Search Bar Goes Here */}
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            {/* Recent Kudos Goes Here */}
          </div>
        </div>
      </div>
    </Layout>
  )
}