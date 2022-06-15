const EditIcon = ({ className, fill = "#858585" }: { className?: string; fill?: string }) => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`group ${className}`}
    >
      <path
        d="M9.4665 3.65332L0.295459 12.2453L0 16.494L4.26642 16.4999L13.3843 7.94929L9.4665 3.65332Z"
        fill={fill}
        className={className}
      />
      <path
        d="M16.6171 3.9253L13.6625 0.734345C13.5972 0.663548 13.5186 0.606413 13.4311 0.566258C13.3436 0.526102 13.249 0.503725 13.1528 0.500427C13.0566 0.497128 12.9607 0.512974 12.8707 0.547043C12.7807 0.581112 12.6983 0.632726 12.6284 0.698889L10.4479 2.73165L14.3716 6.99807L16.5816 4.92395C16.7141 4.79358 16.7916 4.61742 16.7982 4.43168C16.8048 4.24594 16.7399 4.06473 16.6171 3.9253Z"
        fill={fill}
        className={className}
      />
    </svg>
  )
}

export default EditIcon
