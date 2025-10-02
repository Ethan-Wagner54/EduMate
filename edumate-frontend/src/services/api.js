export async function fetchJSON(filename) {
  try {
    const response = await fetch(`/mocks/${filename}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    return [];
  }
}