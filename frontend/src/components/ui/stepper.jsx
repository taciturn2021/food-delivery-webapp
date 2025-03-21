import * as React from "react"
import { cn } from "../../lib/utils"
import { Check } from "lucide-react"

const Stepper = ({ activeStep = 0, steps = [], className }) => {
  return (
    <div className={cn("flex w-full justify-between", className)}>
      {steps.map((label, index) => {
        const isCompleted = index < activeStep
        const isCurrent = index === activeStep

        return (
          <div
            key={label}
            className={cn(
              "flex flex-1 items-center",
              index !== steps.length - 1 && "pr-8"
            )}
          >
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-blue-600 bg-blue-600 text-white",
                  isCurrent && "border-blue-600",
                  !isCompleted && !isCurrent && "border-slate-200"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-blue-600"
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    "text-sm font-medium",
                    (isCompleted || isCurrent) && "text-blue-600",
                    !isCompleted && !isCurrent && "text-slate-500"
                  )}
                >
                  {label}
                </div>
              </div>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-full",
                  isCompleted ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export { Stepper }