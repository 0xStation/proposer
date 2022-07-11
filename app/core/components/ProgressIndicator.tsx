const ProgressIndicator = ({ percent, twsize, cutoff }) => {
  const size = twsize * 4
  const MAX_CIRCUMFERENCE = 2 * (size / 2 - size / 10) * Math.PI * ((360 - cutoff) / 360)
  const strokeDashoffset = MAX_CIRCUMFERENCE - MAX_CIRCUMFERENCE * percent

  return (
    <div className={`w-${twsize} h-${twsize} relative bg-transparent`}>
      {/* base layer */}
      <svg width={`${size}px`} height={`${size}px`} className="absolute top-0 left-0">
        <circle
          cx={`${size / 2}`}
          cy={`${size / 2}`}
          r={`${size / 2 - size / 10}`}
          fill="transparent"
          stroke="#646464"
          strokeWidth={`${size / 10}`}
          strokeDasharray={MAX_CIRCUMFERENCE}
          strokeDashoffset="0"
          transform={`rotate(${90 + cutoff / 2}, ${size / 2}, ${size / 2})`}
        />
      </svg>

      <svg width={`${size}px`} height={`${size}px`} className="absolute top-0 left-0">
        <circle
          cx={`${size / 2}`}
          cy={`${size / 2}`}
          r={`${size / 2 - size / 10}`}
          // strokeLinecap="round"
          fill="transparent"
          stroke="#63EBAF"
          strokeWidth={`${size / 10}`}
          strokeDasharray={MAX_CIRCUMFERENCE}
          strokeDashoffset={!isNaN(strokeDashoffset) ? strokeDashoffset : 0}
          transform={`rotate(${90 + cutoff / 2}, ${size / 2}, ${size / 2})`}
        />
      </svg>
    </div>
  )
}

export default ProgressIndicator
