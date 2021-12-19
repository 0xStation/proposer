const SoundIcon = ({ isOn, clickHandler }: { isOn: boolean; clickHandler: () => void }) => {
  return (
    <svg
      width="31"
      height="24"
      viewBox="0 0 31 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
      onClick={() => clickHandler()}
    >
      {isOn && (
        <>
          <path
            d="M22.2983 6.28266C21.6948 5.71089 20.7736 5.74265 20.2018 6.31443C19.63 6.91796 19.6618 7.83915 20.2336 8.41092C21.2183 9.36388 21.7583 10.6027 21.7583 11.9686C21.7583 13.3345 21.2183 14.5734 20.2336 15.5263C19.63 16.0981 19.63 17.051 20.2018 17.6228C20.4877 17.9405 20.9006 18.0675 21.2818 18.0675C21.663 18.0675 22.0124 17.9405 22.3301 17.6546C23.8865 16.1616 24.7442 14.1286 24.7442 11.9369C24.7124 9.84035 23.8548 7.80739 22.2983 6.28266Z"
            fill="#F2EFEF"
          />
          <path
            d="M25.6969 2.0262C25.0934 1.48619 24.1404 1.51795 23.6004 2.15326C23.0604 2.75679 23.0922 3.70975 23.7275 4.24976C25.9193 6.21919 27.1899 9.04629 27.1899 12.0004C27.1899 14.9546 25.9193 17.7817 23.7275 19.7511C23.1239 20.2911 23.0604 21.2441 23.6004 21.8476C23.8863 22.1653 24.2992 22.3559 24.7122 22.3559C25.0616 22.3559 25.411 22.2288 25.6969 21.9747C28.524 19.4335 30.144 15.8123 30.144 12.0004C30.1758 8.18863 28.5558 4.56741 25.6969 2.0262Z"
            fill="#F2EFEF"
          />
        </>
      )}
      <path
        d="M15.2473 0.183739L6.25773 6.88618H0.889423C0.381182 6.88618 0 7.29913 0 7.7756V16.1934C0 16.7016 0.412947 17.0828 0.889423 17.0828H6.25773L15.2473 23.817C15.8508 24.2617 16.6767 23.8488 16.6767 23.0864V0.882572C16.6767 0.151974 15.819 -0.260972 15.2473 0.183739Z"
        fill="#F2EFEF"
      />
    </svg>
  )
}

export default SoundIcon
