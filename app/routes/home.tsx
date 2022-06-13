import { json, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel'
import { requireUserId } from '~/utils/auth.server'
import { getOtherUsers } from '~/utils/users.server'

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const users = await getOtherUsers(userId)
  return json({ users })
}

export default function Home() {
  const { users } = useLoaderData();
  return (
    <Layout>
      <div className="h-full flex">
        <Outlet />
        <UserPanel users={users} />
      </div>
    </Layout>
  )
}