import { Loader2 } from 'lucide-react'

export default function SuspenseUi() {
  return (
    <div className="flex items-center gap-2 justify-center h-screen">
      <Loader2 className="animate-spin" />
      <span className="text-xs">Loading...</span>
    </div>
  )
}
