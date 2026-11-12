'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import {authenticateOwner} from '@/lib/owner-auth/service'

export async function login(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')
  const supabase = await createClient()
  try { await authenticateOwner(supabase,username,password) }
  catch { redirect('/login?error=Could not authenticate owner') }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  // End this website session only, never sessions on the owner's other devices.
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({scope: 'local'})
  } catch {
    // Local browser logout must still complete if the provider is unreachable.
  } finally {
    const cookieStore = await cookies()
    const ownSession = /^sb-slgkzhchczgvfhryejqu-auth-token(?:\.\d+)?$/
    for (const cookie of cookieStore.getAll()) {
      if (ownSession.test(cookie.name)) {
        cookieStore.set({name: cookie.name, value: '', path: '/', maxAge: 0})
      }
    }
  }
  revalidatePath('/', 'layout')
  redirect('/login')
}
