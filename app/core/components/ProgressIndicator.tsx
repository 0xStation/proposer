const ProgressIndicator = ({ percent, twsize, cutoff }) => {
  const size = twsize * 4
  const MAX_CIRCUMFRANCE = 2 * (size / 2 - size / 10) * Math.PI * ((360 - cutoff) / 360)
  const strokeDashoffset = MAX_CIRCUMFRANCE - MAX_CIRCUMFRANCE * percent

  return (
    <div className={`w-${twsize} h-${twsize} relative`}>
      {/* base layer */}
      <svg width={`${size}px`} height={`${size}px`} className="absolute top-0 left-0">
        <circle
          cx={`${size / 2}`}
          cy={`${size / 2}`}
          r={`${size / 2 - size / 10}`}
          stroke="#646464"
          strokeWidth={`${size / 10}`}
          strokeDasharray={MAX_CIRCUMFRANCE}
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
          stroke="#63EBAF"
          fill="none"
          strokeWidth={`${size / 10}`}
          strokeDasharray={MAX_CIRCUMFRANCE}
          strokeDashoffset={!isNaN(strokeDashoffset) ? strokeDashoffset : 0}
          transform={`rotate(${90 + cutoff / 2}, ${size / 2}, ${size / 2})`}
        />
      </svg>
    </div>
  )
}

export default ProgressIndicator
