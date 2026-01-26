import Dashboard from '@/src/components/Dashboard'

export const metadata = {
  title: 'Dashboard Builder POC',
  description: 'A production-style dashboard builder with drag-and-drop grid layout and dynamic widgets',
}

export default function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  )
}
