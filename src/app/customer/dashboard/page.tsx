// W1: see customer/login/page.tsx - the unverified phone-cookie customer
// ledger surface is intentionally closed for the private launch.
import { redirect } from 'next/navigation'

export default function CustomerDashboardPage() {
  redirect('/customer/login')
}
