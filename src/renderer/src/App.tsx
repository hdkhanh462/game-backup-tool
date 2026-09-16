import { Button } from '@renderer/components/ui/button'

function App(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-2xl font-semibold">GameSave Backup</h1>
      <p className="text-muted-foreground">Electron + TypeScript + React + Tailwind + shadcn/ui</p>
      <div className="flex gap-2">
        <Button>Backup</Button>
        <Button variant="outline">Restore</Button>
      </div>
    </div>
  )
}

export default App
