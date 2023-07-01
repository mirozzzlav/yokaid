export default function useLatLong() {
  const location = async (address) => {
    const data = await (
      await fetch(`https://nominatim.openstreetmap.org/search?q=${address}&format=json&polygon=1&addressdetails=1`)
    ).json();

    const obj = data[0] || { lat: '', lon: '' };

    const { lat } = obj;
    const { lon } = obj;

    return { latitude: lat, longitude: lon };
  };
}
