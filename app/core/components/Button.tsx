import { Loader } from "./Loader"
export const Button = ({ onClick, className, children, loading, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`bg-magic-mint text-tunnel-black rounded mt-8 mx-auto block p-1 ${className}`}
  >
    {loading ? <Loader /> : children}
  </button>
)

export default Button
