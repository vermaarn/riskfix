import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { PreBias, QRReader, Timeline, PredictionTimeline } from "icu-validation-ui";
import {
  fetchAnnotationRes,
  fetchPredictioRes,
  fetchValidationRes,
} from "./responseObjects";
import { IPostAnnotation, IValidation } from "icu-validation-ui/dist/types";

function App() {
  const [count, setCount] = useState(0);
  const [bedsideInfo, setBedsideInfo] = useState("(none)");
  const [bedsideDevices, setBedsideDevices] = useState<string | null>(null);
  const [prebiasValue, setPrebiasValue] = useState<number>(0.5);
  const [modelPause, setModelPause] = useState(true)
  const user = { email: "test@test.com"}
  const devid = 10
 

  const postAnnotation = async (val: IPostAnnotation) => {
    return 1;
  };
  const fetchAnnotations = async (
    user: string,
    devid: number,
    start_time: number,
    end_time: number
  ) => {
    return fetchAnnotationRes;
  };
  const fetchPrediction = async (
    devid: number,
    limit: number,
    start_time: number,
    end_time: number
  ) => {
    return fetchPredictioRes;
  };
  const fetchValidations = async (
    user: string,
    devid: number,
    start_time: number,
    end_time: number
  ) => {
    return fetchValidationRes;
  };
  const postValidation = async (val: IValidation) => {
    return 1;
  };

  return (
    <div className="App" style={{ color: "black", backgroundColor: "white" }}>
      {/* <PreBias setPrebiasValue={setCount} /> */}
      {/* <QRReader
        bedside_info={bedsideInfo}
        setBedsideInfo={setBedsideInfo}
        bedside_devices={bedsideDevices}
        setBedsideDevices={setBedsideDevices}
        handleScan={() => { }}
        handleError={(err) => { }}
      /> */}
      {/* <PredictionTimeline
        user={user}
        prebiasValue={prebiasValue}
        bedsideDevices={bedsideDevices}
        bedsideInfo={bedsideInfo}
        postAnnotation={postAnnotation}
        fetchAnnotations={fetchAnnotations}
        fetchPrediction={fetchPrediction}
        fetchValidations={fetchValidations}
        postValidation={postValidation}
      /> */}
      <Timeline
                user={user.email}
                devid={devid}
                prebias={prebiasValue}
                modelPause={modelPause}
                fetchPrediction={fetchPrediction}
                fetchValidations={fetchValidations}
                postValidation={postValidation}
                fetchInterval={30 * 1000} // i.e  30000
                timeWindow={12 * 30 * 1000} // 10 * 30000
                rollbackTime={0}
              />
    </div>
  );
}

export default App;
