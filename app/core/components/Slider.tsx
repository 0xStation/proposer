import ReactSlider from "react-slider"

const horizontalSlider =
  "content-box w-11/12 h-[10px] border-2 bg-gradient-to-r from-electric-violet to-magic-mint rounded"
const thumbClassName =
  "cursor-pointer align-middle bottom-[calc(50%-15px)] flex flex-col w-fit ml-[-8px]"
const markClassName =
  "absolute border-[5px] border-solid border-marble-white rounded align-middle bottom-[calc(50%-6px)]"

const Slider = ({ onChange, contributor, disabled }) => {
  // commenting out the "mark" implementation for now since it's not responsive.
  // Planning on coming up with a responsive design post-mvp
  return (
    <ReactSlider
      className={horizontalSlider}
      onChange={onChange}
      thumbClassName={thumbClassName}
      markClassName={markClassName}
      disabled={disabled}
      step={1}
      // marks={[1, 50, 100]}
      min={1}
      max={100}
      renderThumb={(props, state) => {
        const { valueNow } = state
        props.style.left = parseFloat(props?.style?.left || "0") * 1.03
        return (
          <div {...props} style={props.style}>
            <p className="text-marble-white text-center text-base">{contributor.data.name}</p>
            <p className="text-marble-white text-center text-base">{valueNow} RAILⒺ</p>
            <img
              src={contributor.data.pfpURL}
              alt="PFP"
              className="h-[40px] w-[40px] border border-marble-white rounded-full m-auto"
            />
          </div>
        )
      }}
      // renderMark={(props) => {
      //   // override the styling offset that's automatically applied based on the thumb-size
      //   return <div {...props} style={{ left: `calc(1.1 * ${props?.style?.left}px` }}></div>
      // }}
    />
  )
}
export default Slider
