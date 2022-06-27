export const signatureToVRS = (signature: string) => {
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  const r = "0x" + signature.substring(2).substring(0, 64)
  const s = "0x" + signature.substring(2).substring(64, 128)
  return { v, r, s }
}
