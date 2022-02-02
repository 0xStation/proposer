const Demo = () => {
  const fetchDemo = async () => {
    let res = await fetch("/api/demo", {
      method: "POST",
    })

    let j = await res.json()
    console.log(j)
  }
  return (
    <div className="text-marble-white">
      <span>demo</span>
      <button onClick={() => fetchDemo()}>fetch</button>
    </div>
  )
}

export default Demo
