export const lookup = async (address: string) => {
  const response = await fetch(`/api/latlon?address=${address}`);
  const data = await response.json();
  return data;
}