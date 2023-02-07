export type Transaction = {
  target: string
  function: string
  args: any[]
  value: string
  operation: number
}

export type PreparedTransaction = {
  target: string
  value: string
  operation: number
  data: string
}
