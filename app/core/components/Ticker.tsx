/**
 * The marquee based ticker featured on the main station layout.
 * The speed of the ticker can be controlled by altering the duration of the marquee animation found in
 * tailwind.config.js. Right now it is set to 30s because I found if it was too fast it hurt me eyes. We can also just
 * pull it out by removing the animation marquee class if we don't want it to be animated.
 */
const Ticker = () => {
  return (
    <div className="relative h-12 bg-tunnel-black flex overflow-hidden border-b border-concrete">
      <div className="animate-marquee whitespace-nowrap text-neon-blue font-vt323 text-5xl">
        <p>WELCOME TO STATION. WELCOME TO STATION. WELCOME TO STATION. WELCOME TO STATION.</p>
      </div>
    </div>
  )
}

export default Ticker
