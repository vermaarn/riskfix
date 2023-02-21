import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { PreBias, QRReader, PredictionTimeline } from "icu-validation-ui"

function App() {
  const [count, setCount] = useState(0)
  const [bedsideInfo, setBedsideInfo] = useState("(none)");
  const [bedsideDevices, setBedsideDevices] = useState<string | null>(null);
  const [prebiasValue, setPrebiasValue] = useState<number>();

  return (
    <div className="App">
      <PreBias setPrebiasValue={setCount} />
        <PredictionTimeline
            user={{email: "AAAA"}}
            prebiasValue={prebiasValue}
            bedsideDevices={bedsideDevices}
            bedsideInfo={bedsideInfo}
            fetchAnnotations={async () => {  return "a" as any }}
            postAnnotation={async () => {  return "a" as any }}
            fetchPrediction={async () => {  return "a" as any }}
            fetchValidations={async () => {  return "a" as any }}
            postValidation={async () => {  return "a" as any }}
          />
    </div>
  )
}

export default App
