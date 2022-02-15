import ReactSlider from "react-slider"

const horizontalSlider =
  "content-box w-11/12 h-[10px] border-2 bg-gradient-to-r from-electric-violet to-magic-mint rounded"
const thumbClassName =
  "cursor-pointer align-middle bottom-[calc(50%-15px)] flex flex-col w-fit ml-[-8px]"
const markClassName =
  "absolute border-[5px] border-solid border-marble-white rounded align-middle bottom-[calc(50%-6px)]"

const Slider = ({ onChange, contributor, disabled }) => {
  return (
    <ReactSlider
      className={horizontalSlider}
      onChange={onChange}
      thumbClassName={thumbClassName}
      markClassName={markClassName}
      disabled={disabled}
      step={1}
      min={1}
      max={100}
      renderThumb={(props, state) => {
        const { valueNow } = state
        return (
          <div {...props}>
            <p className="text-marble-white text-center text-base">{contributor.data.name}</p>
            <p className="text-marble-white text-center text-base">{valueNow} RAIL🅔</p>
            {contributor.data.pfpURL ? (
              <img
                src={contributor.data.pfpURL}
                alt="PFP"
                className="h-[40px] w-[40px] border border-marble-white rounded-full m-auto"
              />
            ) : (
              <div
                className={`h-[40px] w-[40px] place-self-center border border-marble-white bg-concrete rounded-full place-items-center`}
              ></div>
            )}
          </div>
        )
      }}
    />
  )
}
export default Slider
