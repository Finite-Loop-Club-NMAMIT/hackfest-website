import { useState, useEffect } from "react";
import CriteriaTab from "./CriteriaTab";
import RemarksTab from "./RemarksTab";
import ScoreTab from "./ScoreTab";

export default function JuryTab() {
  const [activeSubTab, setActiveSubTab] = useState("criteria");

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTab = localStorage.getItem("jurySubTab");
      if (storedTab && ["criteria", "remarks", "score"].includes(storedTab)) {
        setActiveSubTab(storedTab);
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jurySubTab", activeSubTab);
    }
  }, [activeSubTab]);

  return (
    <div className="w-full">
      {/* Sub-tab Navigation */}
      <div className="flex flex-row justify-center border-b mb-4">
        <button
          onClick={() => setActiveSubTab("criteria")}
          className={`px-4 py-2 text-center transition-colors ${
            activeSubTab === "criteria"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Criteria
        </button>
        <button
          onClick={() => setActiveSubTab("remarks")}
          className={`px-4 py-2 text-center transition-colors ${
            activeSubTab === "remarks"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Remarks
        </button>
        <button
          onClick={() => setActiveSubTab("score")}
          className={`px-4 py-2 text-center transition-colors ${
            activeSubTab === "score"
              ? "border-b-2 border-purple-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Score
        </button>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === "criteria" && <CriteriaTab />}
      {activeSubTab === "remarks" && <RemarksTab />}
      {activeSubTab === "score" && <ScoreTab />}
    </div>
  );
}
