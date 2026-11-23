import type { Metadata } from 'next'
import { AdminOrders } from './AdminOrders'

export const metadata: Metadata = { title: '订单管理', robots: { index: false, follow: false } }

export default function AdminPage() {
  return <AdminOrders />
}
