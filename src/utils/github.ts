function tName2GHTName(name: string) {
  return `HF25-${name}`
}

function tName2GHRName(name: string, which?: number) {
  return `HF25-${name}${which ? "-" + which : ""}`
}

export {
  tName2GHTName,
  tName2GHRName
}
