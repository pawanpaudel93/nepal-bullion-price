export function formatNpr(value: number): string {
  return `Rs ${value.toLocaleString('en-IN')}`;
}
