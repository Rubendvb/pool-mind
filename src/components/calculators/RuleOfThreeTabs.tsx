"use client";
import { useState } from "react";
import { RuleOfThreeCalculator } from "./RuleOfThreeCalculator";
import { CompoundRuleOfThreeCalculator } from "./CompoundRuleOfThreeCalculator";

type Mode = "simple" | "compound";

export function RuleOfThreeTabs() {
  const [mode, setMode] = useState<Mode>("simple");

  return (
    <div className="space-y-4">
      <div className="px-4">
        <div className="glass flex rounded-xl overflow-hidden">
          {(["simple", "compound"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === m
                  ? "bg-ocean-600/60 text-white"
                  : "text-ocean-400 hover:text-white"
              }`}
            >
              {m === "simple" ? "Simples" : "Composta"}
            </button>
          ))}
        </div>
      </div>

      {mode === "simple" ? <RuleOfThreeCalculator /> : <CompoundRuleOfThreeCalculator />}
    </div>
  );
}
