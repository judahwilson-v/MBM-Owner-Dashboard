import { createClient } from '@/utils/supabase/server'

// Membership is owner-provisioned; no public signup or profile field grants it.
export async function websiteMembership() {
  const client = await createClient()
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) return { client, principal: null }
  const { data: principal, error } = await client.from('website_approver_principals')
    .select('principal_id, display_name, active')
    .eq('supabase_user_id', user.id).single()
  return { client, principal: !error && principal?.active ? principal : null }
}
