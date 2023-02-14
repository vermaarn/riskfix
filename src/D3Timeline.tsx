import { useEffect, useRef, useState } from "react";
import { PredictionScores, ValidatedScores, IValidation } from "./types";
import * as d3 from "d3"

const UPDATE_TIME = 5000;
const ROLLBACK_TIME = 24 * 60 * 60 * 1000;

interface IData {
  date: number;
  value: number;
}

function useStateAndRef<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
  const [value, setValue] = useState<T>(initial);
  const valueRef = useRef<T>(value);
  valueRef.current = value;
  return [value, setValue, valueRef];
}

interface ID3TimelineProps {
  devid: number;
  prebias: number;
  modelPause: boolean;
  user: string;
  fetchPrediction: (devid: number, limit: number, start_time: number, end_time: number) => Promise<PredictionScores>
  fetchValidations: (user: string, devid: number, start_time: number, end_time: number) => Promise<ValidatedScores>
  postValidation: (val: IValidation) => Promise<number | undefined>
}

export default function D3Timeline(props: ID3TimelineProps) {
  const { fetchPrediction, fetchValidations, postValidation } = props
  const visRef = useRef<HTMLDivElement>(null);
  const [pause, setPause] = useState(false);
  const [validationData, setValidationData, validationRef] = useStateAndRef<IData[]>([]);
  const [predictionData, setPredictionData, predictionRef] = useStateAndRef<IData[]>([]);

  useEffect(() => {
    if (props.modelPause) {
      setPause(true);
    } else {
      setPause(false);
    }
  }, [props.modelPause]);

  useEffect(() => {

    const fetchInitalPredictions = async () => {
      const currTime = Math.floor(new Date().getTime() / 30000) * 30000; // get 30 sec interval
      const startTime = currTime - 30000 * 10; // get last 10 points

      const predictionRes = await fetchPrediction(
        props.devid,
        10,
        startTime - ROLLBACK_TIME,
        currTime - ROLLBACK_TIME
      );

      const validationRes = await fetchValidations(
        props.user,
        props.devid,
        startTime - ROLLBACK_TIME,
        currTime - ROLLBACK_TIME
      );
      console.log("RES", predictionRes, validationRes)

      let validationArr: any[] = [];

      // Get last 10 points which fall in a 30 second interval
      const predictedLastTen = Array.from({ length: 10 }).map((_, i) => {
        const intervaledTime: number = currTime - (i * 30000) - ROLLBACK_TIME; // go back 30 seconds
        const predictedTimeIdx = predictionRes.times.findIndex(
          (t) => String(t) === String(intervaledTime)
        );
        const validatedTimeIdx = validationRes.rounded_timestamp.findIndex(
          (t) => String(t) === String(intervaledTime)
        );

        /** Added  */
        if (validatedTimeIdx !== -1 && predictedTimeIdx !== -1) {
          validationArr.push({
            value: parseFloat(validationRes.validated_risk_score[validatedTimeIdx]),
            date: intervaledTime,
          });
        } else if (predictedTimeIdx !== -1) {
          // if we do not see a point submitting with 30 sec interval submit -1
          validationArr.push({
            value: predictionRes.scores[predictedTimeIdx],
            date: intervaledTime,
          });
        } else {
          // should be impossible to do
          validationArr.push({
            value: -1,
            date: intervaledTime,
          });
        }

        if (predictedTimeIdx !== -1) {
          return {
            value: predictionRes.scores[predictedTimeIdx],
            date: intervaledTime,
          };
        } else {
          // if we do not see a point submitting with 30 sec interval submit -1
          return {
            value: -1,
            date: intervaledTime,
          };
        }
      });

      setPredictionData(predictedLastTen);
      setValidationData(validationArr);
      console.log(predictedLastTen, validationArr, "VAL")
      
    };

    fetchInitalPredictions();
    setInterval(async () => {
      if (validationRef.current.at(0) && predictionRef.current.at(0)){
        const validationPostBody = {
          rounded_timestamp: validationRef.current.at(0)!.date ,
          devid: props.devid,
          user: props.user,
          prebias_score: props.prebias,
          original_risk_score: predictionRef.current.at(0)!.value,
          validated_risk_score: validationRef.current.at(0)!.value,
        };
        await postValidation(validationPostBody);
        console.log(validationPostBody)
      }

      // console.log("REFETCHING", validationData)
      // console.log("FETCHING", predictionData);
      await fetchInitalPredictions();
    }, 30 * 1000);
  }, []);

  useEffect(() => {
    if (!visRef.current || !validationData || !predictionData) return;

    // set the dimensions and margins of the graph
    const margin = { top: 40, right: 50, bottom: 60, left: 20 },
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

    d3.select("#chart").remove();

    // append the svg object to the body of the page
    const svg = d3
      .select("#" + visRef.current.id)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "chart")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const backgroundColors = ["#E78B9B", "#FCEDD9", "#DAEAC7"];
    const colDict = { prediction: "#0366B1", validation: "#819AAE" };

    const grad = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "grad")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    grad
      .selectAll("stop")
      .data(backgroundColors)
      .enter()
      .append("stop")
      .style("stop-color", function (d: any) {
        return d;
      })
      .attr("offset", function (d: any, i: any) {
        return 100 * (i / (backgroundColors.length - 1)) + "%";
      });

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "url(#grad)");

    // Add X axis --> it is a date format
    const x = d3
      .scaleTime()
      .domain(
        d3.extent<IData, number>(validationData, (d, index, array) => {
          return d.date;
        }) as [number, number]
      )
      .range([0, width]);

    // Add Y axis
    const y = d3.scaleBand<number>().domain([0, 0.5, 1]).range([height, 0]);

    const xAxis = d3
      .axisBottom<Date>(x)
      .tickValues(
        validationData.map((d) => {
          return new Date(d.date);
        })
      )
      .tickFormat(d3.timeFormat("%H:%M:%S"));

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text");

    svg
      .append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(
        d3.axisRight<number>(y).tickFormat((num) => {
          if (num === 0) return "Low";
          if (num === 0.5) return "Medium";
          if (num === 1) return "High";
          return "High";
        })
      );

    const line = d3
      .line<IData>(
        (d, _, __) => {
          return x(d.date)!;
        },
        (d, _, __) => {
          return y(d.value)!;
        }
      )
      .defined(function (d, index, data) {
        return d.value !== -1;
      });

    const interpolatedLine = d3
      .line<IData>(
        (d, i, __) => {
          return x(d.date)!;
        },
        (d, i, data) => {
          const realValue = data.slice(i).find((d) => {
            return d.value !== -1;
          });

          const val = realValue === undefined ? -1 : realValue.value;
          // if ( i < data.length - 1) {
          //   return y(0.5)!
          // }
          return y(val)!;
        }
      )
      .defined(function (d, index, data) {
        return index > 0 && index < data.length - 1;

        // return d.value === -1;
      });

    const visY = visRef.current.getBoundingClientRect().top + margin.top;

    const callDrag: any = d3
      .drag<Element, any>()
      .on("drag", function (this, e, d) {
        const pos = e.sourceEvent.targetTouches
          ? e.sourceEvent.targetTouches[0].clientY
          : e.sourceEvent.clientY;
        const ey = (pos - visY) / height;
        if (d.date === validationData[0].date) {
          if (ey <= 0.33) {
            setValidationData((d) => [
              { value: 1, date: d[0].date },
              ...d.slice(1, d.length),
            ]);
          } else if (ey >= 0.66) {
            setValidationData((d) => [
              { value: 0, date: d[0].date },
              ...d.slice(1, d.length),
            ]);
          } else {
            setValidationData((d) => [
              { value: 0.5, date: d[0].date },
              ...d.slice(1, d.length),
            ]);
          }
        }
      });

    // Add partitioning gray lines
    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "lightblue")
      .attr("stroke-width", 1)
      .attr(
        "d",
        `M0, ${0.33 * height - margin.top} L${width}, ${
          0.33 * height - margin.top
        } Z`
      )
      .attr("transform", `translate(0, ${45})`);

    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "lightblue")
      .attr("stroke-width", 1)
      .attr(
        "d",
        `M0, ${0.66 * height - margin.top} L${width}, ${
          0.66 * height - margin.top
        } Z`
      )
      .attr("transform", `translate(0, ${45})`);

    svg
      .append("path")
      .datum(predictionData)
      .attr("fill", "none")
      .attr("stroke", colDict.prediction)
      .attr("stroke-width", 6)
      .attr("d", line)
      .attr("transform", `translate(0, ${55})`);

    // added partition data
    svg
      .append("path")
      .datum(predictionData)
      .attr("fill", "none")
      .attr("stroke", colDict.prediction)
      .attr("stroke-width", 6)
      .attr("d", interpolatedLine)
      .attr("transform", `translate(0, ${55})`)
      .attr("opacity", 0.2);

    // Add the line
    svg
      .append("path")
      .datum(validationData)
      .attr("fill", "none")
      .attr("stroke", colDict.validation)
      .attr("stroke-width", 4)
      .attr("d", line)
      .attr("transform", `translate(0, ${55})`)
      .style("stroke-dasharray", "25, 5");

    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(validationData)
      .enter()
      .append("circle")
      .attr("cx", function (this, d, i, _) {
        return x(d.date)!;
      })
      .attr("cy", function (this, d, i, _) {
        return y(d.value)!;
      })
      .attr("id", function (this, d, i, _) {
        if (i === 0) {
          return "first-dot";
        }
        return "";
      })
      .attr("r", 8)
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("display", function (this, d, i, _) {
        if (d.value === -1) {
          return "none";
        }
        return "";
      })
      .attr("fill", colDict.validation)
      .call(callDrag)
      .attr("transform", `translate(0, ${55})`);

    function animateOriginalPoint() {
      svg
        .select("#first-dot")
        .transition()
        .ease(d3.easeCubicIn)
        .duration(1000)
        .attr("r", 8);
    }

    function animateNewPoint() {
      svg
        .select("#first-dot")
        .transition()
        .ease(d3.easeCubicOut)
        .duration(1000)
        .attr("r", 12)
        .on("end", animateOriginalPoint);
    }

    svg.select("#first-dot").transition().on("end", animateNewPoint);

    const missingValueRectWidth = width / 10;
    svg
      .append("g")
      .selectAll("dot")
      .data(validationData)
      .enter()
      .append("rect")
      .attr("x", function (this, d, i, _) {
        if (i === validationData.length - 1) {
          return x(d.date)!;
        }
        return x(d.date)! - missingValueRectWidth / 2;
      })
      .attr("y", function (this, d, i, _) {
        return 0;
      })
      .attr("width", function (this, d, i, _) {
        if (i !== 0 && i !== validationData.length - 1) {
          return missingValueRectWidth;
        }
        return missingValueRectWidth / 2;
      })
      .attr("height", height)
      .attr("fill", "#69a3b2")
      .attr("display", function (this, d, i, _) {
        if (d.value !== -1) {
          return "none";
        }
        return "";
      })
      .attr("opacity", 0.3);

    // legend
    const legendKeys = [
      "Model Predicted Risk Level",
      "Clinician Validated Risk Level",
    ];
    const lineLegend = svg
      .selectAll(".lineLegend")
      .data(legendKeys)
      .enter()
      .append("g")
      .attr("class", "lineLegend")
      .attr("transform", function (d, i) {
        return (
          "translate(" +
          (width - margin.right - 100) +
          "," +
          (i * 15 - 30) +
          ")"
        );
      });
    lineLegend
      .append("text")
      .text(function (d) {
        return d;
      })
      .attr("transform", "translate(15, 6)")
      .attr("font-size", "0.7em"); //align texts with boxes

    lineLegend
      .append("rect")
      .attr("fill", (d) =>
        d === "Model Predicted Risk Level"
          ? colDict.prediction
          : colDict.validation
      )
      .attr("width", 12)
      .attr("height", 5);
  }, [visRef, validationData, predictionData]);

  function handleClick() {
    setPause((p) => !p);
  }

  // useEffect(() => {
  //   if (props.modelPause && intervalStatus !== "paused") {
  //     handleClick();
  //   }
  //   if (!props.modelPause && intervalStatus === "paused") {
  //     handleClick();
  //   }
  // }, [props.modelPause]);

  return (
    <div>
      <div className="flex justify-between mb-2">
        <h3
          className={`text-lg py-2 mt-2 text-white font-bold rounded-lg px-4 ${
            pause ? "bg-red-600 " : "bg-green-600"
          }`}
        >
          {!pause
            ? "Live data ON: points are read-only"
            : "Live data OFF: points are now editable"}
        </h3>
        <button
          onClick={handleClick}
          className={`py-2 mt-2 font-bold rounded-lg px-4 border ${
            !pause ? "border-red-600 " : "border-green-600"
          }`}
        >
          {" "}
          Toggle Live Data {!pause ? "OFF" : "ON"}{" "}
        </button>
      </div>
      <div ref={visRef} id="my_dataviz" />
      <div>
        <strong> Timestamp of latest prediction: </strong>{" "}
        {validationData.length > 0 &&
          new Date(predictionData[0].date).toString()}{" "}
        <br />
        <strong> Last 10 points fetched:</strong>
        {predictionData.map((p, idx) => {
          return <span key={idx + new Date().getTime()}> {p.value}, </span>;
        })}{" "}
        <br />
        <strong>Current Bedside Id:</strong> {props.devid} <br />
        <strong>Prebias Value:</strong> {props.prebias}
      </div>
    </div>
  );
}
