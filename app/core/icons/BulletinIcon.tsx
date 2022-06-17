const BulletinIcon = ({ className, fill }: { className?: string; fill?: string }) => {
  return (
    <svg
      width="12"
      height="19"
      viewBox="0 0 12 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 6C12 2.68212 9.31788 0 6 0C2.68212 0 0 2.68212 0 6C0 8.80132 1.92715 11.1656 4.5298 11.8212L5.56291 18.4768C5.64238 18.9934 6.37748 18.9934 6.45695 18.4768L7.49007 11.8212C10.0728 11.1656 12 8.80132 12 6Z"
        fill={fill}
      />
    </svg>
  )
}

export default BulletinIcon
