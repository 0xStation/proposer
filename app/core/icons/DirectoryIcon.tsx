const DirectoryIcon = ({ className, fill = "white" }: { className?: string; fill?: string }) => {
  return (
    <svg
      width="12"
      height="17"
      viewBox="0 0 12 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.6647 8.7408L4.39176 9.5977V0H2.12354V9.6096L2.87063 8.73871C2.88859 8.71783 2.908 8.69842 2.92908 8.68068C3.14889 8.49406 3.47808 8.52099 3.6647 8.7408Z"
        fill={fill}
      />
      <path
        d="M0 3.45766V14.2018C0 14.407 0.0323555 14.6042 0.0914305 14.7886C0.538772 13.754 1.55724 13.0213 2.73895 13.0213H11.9997V1.58813H5.43531V11.0195C5.43531 11.1727 5.36789 11.3182 5.2512 11.4173C5.03139 11.604 4.70199 11.5768 4.51558 11.357L3.26478 9.88264L1.9979 11.3593C1.89875 11.4747 1.7543 11.5411 1.60212 11.5413C1.31384 11.5415 1.08026 11.3079 1.08005 11.0197V1.75054C0.44922 2.04132 0 2.69344 0 3.45766Z"
        fill={fill}
      />
      <path
        d="M12.0002 14.0653H2.73961C1.77562 14.0653 0.971951 14.8337 0.898682 15.8152C1.16942 15.9795 1.48421 16.0736 1.81841 16.0736H12.0004V14.0653H12.0002Z"
        fill={fill}
      />
    </svg>
  )
}

export default DirectoryIcon