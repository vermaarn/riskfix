import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface IPreBiasProps {
  setPrebiasValue: (value: number) => void;
}

function PreBias({ setPrebiasValue }: IPreBiasProps) {
  const [selectedValue, setSelectedValue] = useState<[number]>([0])

  const captureRating = () => {
    setPrebiasValue(selectedValue[0]);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col text-center space-y-2 p-4 w-full bg-gray-100">
        <h2 className="text-xl underline">
          Pre-Bias Deterioration Risk Survey
        </h2>
        <h3 className="text-lg">
          Drag the cross along the risk gradient below to express your current
          estimate of the patient's cardiac arrest risk level
        </h3>
      </div>
      <div>
        <PrebiasChart biasPoint={selectedValue} setBiasPoint={setSelectedValue} />
      </div>
      <button
        className="h-16  bg-gray-200  rounded-lg mx-8 text-xl text-bold"
        onClick={captureRating}
      >
        Submit
      </button>
    </div>
  );
}

const PrebiasChart: React.FC<{biasPoint: [number], setBiasPoint: (point: [number]) => void}> = ({biasPoint, setBiasPoint}) => {
  const visRef = useRef<HTMLDivElement>(null);

  const margin = { top: 40, right: 20, bottom: 60, left: 60 },
    width = window.screen.width - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;



  useEffect(() => {
    if (!visRef.current) return;
    d3.select("#chart").remove();

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

    // Add Y axis
    const y = d3.scaleBand<number>().domain([0, 0.5, 1]).range([height, 0]);
    svg
      .append("g")
      .attr("transform", `translate(${0}, 0)`)
      .style("font-size", "1.2em")
      .call(
        d3.axisRight<number>(y).tickFormat((num) => {
          if (num === 0) return "Low";
          if (num === 0.5) return "Medium";
          if (num === 1) return "High";
          return "High";
        })
      );
    svg
      .append("text")
      .attr("text-anchor", "end")
      .style("font-size", "1.5em")
      .attr("y", -30)
	  .attr("x", -150)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Risk");

    const visY = visRef.current.getBoundingClientRect().top + margin.top;
    const callDrag: any = d3
      .drag<Element, any>()
      .on("drag", function (this, e, d) {
        const pos = e.sourceEvent.targetTouches
          ? e.sourceEvent.targetTouches[0].clientY
          : e.sourceEvent.clientY;
        const ey = (pos - visY) / height;
        if (ey <= 0.33) {
          setBiasPoint([1]);
        } else if (ey >= 0.66) {
          setBiasPoint([0]);
        } else {
          setBiasPoint([0.5]);
        }
      });

    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(biasPoint)
      .enter()
      .append("circle")
      .attr("cx", function (this, d, i, _) {
        return width / 2;
      })
      .attr("cy", function (this, d, i, _) {
        return y(d)!;
      })
      .attr("r", 22)
      .attr("fill", colDict.validation)
      .call(callDrag)
      .attr("transform", `translate(0, ${55})`);

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
  }, [visRef, biasPoint]);

  return <div id="prebias-vis" ref={visRef} />;
};

export default PreBias;
