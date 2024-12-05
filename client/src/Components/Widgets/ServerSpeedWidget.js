import React from "react";
import SimplifiedLineChart from "../Graphs/SimplifiedLineChart";

const ServerSpeedWidget = ({ transferSpeeds }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 p-4 w-full md:w-[30%] flex items-center shadow rounded h-[70px]">
      <p className="p-3 whitespace-nowrap font-mono rounded-full w-[190px] h-7 font-bold bg-[#304463] text-indigo-200 flex items-center justify-center mr-2">
        {transferSpeeds.length > 0
          ? `${transferSpeeds[transferSpeeds.length - 1].speed} Bytes/s`
          : "No data"}
      </p>
      <SimplifiedLineChart transferSpeeds={transferSpeeds} />
    </div>
  );
};

export default ServerSpeedWidget;
