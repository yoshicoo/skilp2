import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
export default function Home() {
  const token = cookies().get('skilp_auth')?.value
  if (token === 'ok') redirect('/app')
  redirect('/login')
}
