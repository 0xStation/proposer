import DatetimeField from "app/core/components/form/DatetimeField"
import IntegerField from "app/core/components/form/IntegerField"
import RadioField from "app/core/components/form/RadioField"
import SelectField from "app/core/components/form/SelectField"
import { ScheduleEnds, SchedulePeriodUnit } from "../types"

export const ScheduleFields = ({ formState, minCycles = 1 }) => {
  return (
    <>
      {/* START DATE */}
      <DatetimeField title="Start date*" fieldName="scheduleStartDate" minDate={new Date()} />
      {/* REPEAT */}
      <label className="font-bold block mt-6">Repeat every</label>
      <div className="flex flex-row space-x-4 w-1/2">
        <IntegerField fieldName="schedulePeriodCoefficient" min={1} />
        <SelectField
          fieldName="schedulePeriodUnit"
          options={[
            SchedulePeriodUnit.MINUTE, // uncomment for testing
            SchedulePeriodUnit.WEEK,
            SchedulePeriodUnit.MONTH,
          ]}
        />
      </div>
      {/* ENDS */}
      <label className="font-bold block mt-6">Ends</label>
      <div className="mt-4 flex flex-col space-y-2">
        <RadioField
          fieldName="scheduleEnds"
          value={ScheduleEnds.NEVER}
          label="Never (can edit later)"
        />
        <div className="flex flex-row space-x-2 items-center">
          <RadioField fieldName="scheduleEnds" value={ScheduleEnds.AFTER_CYCLES} label="After" />
          <IntegerField
            fieldName="scheduleMaxCount"
            min={minCycles}
            disabled={formState.values.scheduleEnds !== ScheduleEnds.AFTER_CYCLES}
            width="w-16"
            required={formState.values.scheduleEnds === ScheduleEnds.AFTER_CYCLES}
          />
          <div>cycles</div>
        </div>
      </div>
    </>
  )
}
export default ScheduleFields
