import { CanvasDemo } from './components/canvas-demo/canvas-demo'
import { GeneratorDemo } from './components/generator-demo/generator-demo'

function App(): JSX.Element {
  return (
    <div className="app">
      <h1>Overflow Kit Demo</h1>
      <CanvasDemo />
      <GeneratorDemo />
    </div>
  )
}

export default App
