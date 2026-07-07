import { CanvasDemo } from './components/canvas-demo/canvas-demo'
import { GeneratorDemo } from './components/generator-demo/generator-demo'
import { ContainerDemo } from './components/container-demo/container-demo'

function App(): JSX.Element {
  return (
    <div className="app">
      <h1>Overflow Kit Demo</h1>
      <ContainerDemo />
      <CanvasDemo />
      <GeneratorDemo />
    </div>
  )
}

export default App
