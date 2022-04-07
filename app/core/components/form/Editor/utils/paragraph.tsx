export const createParagraphNode = (children = [{ text: "" }]) => ({
  type: "paragraph",
  children,
})
