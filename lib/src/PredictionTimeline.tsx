import { useCallback, useEffect, useState } from "react";
import { IValidation, IRecordAnnotation, IAnnotation, ValidatedScores, PredictionScores } from "./types";
import D3Timeline from "./D3Timeline";
import { DateTime } from "luxon"

export interface IPredicitionTimelineProps {
  prebiasValue?: number;
  bedsideDevices: string | null;
  bedsideInfo: string;
  user: { email: string } | undefined;
  fetchInterval: number; // i.e  30000
  timeWindow: number; // 10 * 30000
  rollbackTime: number;
  recordValidation: (val: IValidation) => Promise<number | undefined>
  fetchAnnotation: (user: string, devid: number, start_time: number, end_time: number) => Promise<IAnnotation>
  recordAnnotation: (val: IRecordAnnotation) => Promise<number | undefined>
  fetchPrediction: (devid: number, limit: number, start_time: number, end_time: number) => Promise<PredictionScores>
  fetchValidation: (user: string, devid: number, start_time: number, end_time: number) => Promise<ValidatedScores>
}

const PredictionTimeline: React.FC<IPredicitionTimelineProps> = ({
  prebiasValue,
  bedsideDevices,
  user,
  fetchInterval,
  timeWindow,
  rollbackTime,
  fetchAnnotation,
  recordAnnotation,
  fetchPrediction,
  fetchValidation,
  recordValidation,
}) => {
  const [comment, setComment] = useState("");
  const [writtenComments, setWrittenComments] = useState<
    { timestamp: number; comment: string }[]
  >([]);
  const [modelPause, setModelPause] = useState(false);
  const [annotationTimeout, setAnnotationTimeout] = useState<NodeJS.Timeout>();
  const [message, setMessage] = useState("");
  const [devid, setDevid] = useState<number>(109);

  // Set the correct beside id
  useEffect(() => {
    const devid = bedsideDevices && parseInt(bedsideDevices);

    if (!devid) {
    } else {
      setDevid(devid);
    }
  }, [bedsideDevices]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }
    const endTime = new Date().getTime();
    const hours = 100;
    const startTime = endTime - hours * 60 * 60 * 1000;
    fetchAnnotation(user.email, devid, startTime, endTime)
      .then((res) => {
        setWrittenComments(
          res.annotation.map((c, i) => ({
            comment: c,
            timestamp: res.timestamp[i],
          }))
        );
      })
      .catch((err) => console.log(err));
  }, [user, devid]);

  const onTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setComment(e.target.value);
  };

  useEffect(() => {
    if (comment === "") {
      setModelPause(false);
    } else {
      setModelPause(true);
    }
  }, [comment]);

  const onClearClick = useCallback(() => {
    setComment("");
    setModelPause(false);
  }, []);

  const writeComment = () => {
    if (comment === "") return;
    const commentTime = new Date().getTime()
    const newComment = { comment, timestamp: commentTime };
    setWrittenComments((c) => [newComment, ...c]);
    setComment("");
    if (user?.email && prebiasValue !== undefined) {
      recordAnnotation({
        timestamp: commentTime,
        devid,
        user: user.email,
        rounded_timestamp: Math.floor(commentTime / 30000) * 30000,
        annotation: newComment.comment,
      })
    }
  };

  const onCommentKeyPress: React.KeyboardEventHandler<HTMLTextAreaElement> =
    useCallback(
      (e) => {
        // Add comments when we press the enter key
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      },
      [comment]
    );

  const onCommentUnfocus = useCallback(() => {
    writeComment();
    clearTimeout(annotationTimeout);
  }, [comment]);

  // pause on focus
  const onCommentFocus: React.FocusEventHandler<HTMLTextAreaElement> =
    useCallback((e) => {
      // setModelPause(true)
      const id = setTimeout(() => {
        // console.log(e, "unfocusing")
        setMessage("30 Second Limit Reached. Adding comment and resuming...");
        setTimeout(() => setMessage(""), 5000);
        // e.currentTarget.blur()
        const tmp = document.createElement("input");
        document.body.appendChild(tmp);
        tmp.focus();
        document.body.removeChild(tmp);
      }, 30 * 1000);
      setAnnotationTimeout(id);
    }, []);

  return (
    <div>
      <div style={{ height: "90vh" }} className="">
        <div className="flex h-full ">
          <div className="w-full p-4">
            <div className="mb-4">
              Deviations between the two lines express a time when a clinician's
              and the model's understanding of risk differed. Drag the final point
              on the curve along the risk gradient according to your understanding
              of the patient's deterioration risk level
            </div>
            {prebiasValue !== undefined && user?.email && (
              <D3Timeline
                user={user.email}
                devid={devid}
                prebias={prebiasValue}
                modelPause={modelPause}
                fetchPrediction={fetchPrediction}
                fetchValidation={fetchValidation}
                recordValidation={recordValidation}
                fetchInterval={fetchInterval} // i.e  30000
                timeWindow={timeWindow} // 10 * 30000
                rollbackTime={rollbackTime}
              />
            )}
          </div>
          <div className="px-2 space-y-4 bg-gray-100 h-full flex flex-col ">
            <div>
              <h2 className="text-lg my-2">Annotate: </h2>
              {message && (
                <div className="my-2 px-2 bg-gray-200 py-1 rounded-lg">
                  {" "}
                  {message}{" "}
                </div>
              )}
              <div>
                <textarea
                  onFocus={onCommentFocus}
                  onBlur={onCommentUnfocus}
                  onKeyDown={onCommentKeyPress}
                  value={comment}
                  onChange={onTextChange}
                  placeholder="Why did you make a correction?"
                  rows={6}
                  className="p-2 w-full"
                ></textarea>
                <button
                  onClick={onClearClick}
                  className="w-full py-2 bg-gray-300 rounded-lg"
                >
                  Enter{" "}
                </button>
              </div>
            </div>
            <div
              style={{ height: "24em", width: "20em" }}
              className="flex flex-col overflow-hidden"
            >
              <h2 className="text-lg mb-2">Recent Comments:</h2>
              <div className="flex flex-col space-y-2 text-md h-full overflow-auto">
                {writtenComments.map((c, idx) => {
                  return (
                    <div
                      key={idx + c.timestamp}
                      className="p-1 bg-gray-100 rounded-lg border-b-blue-400 border"
                    >
                      <b>{DateTime.fromMillis(c.timestamp).toFormat("ff")}</b>:
                      {" " + c.comment}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionTimeline;
