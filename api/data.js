export default async function handler(req, res) {
  try {
    const token = process.env.ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "No ACCESS TOKEN found" });
    }

    const [tempRes, humidityRes, qualityRes] = await Promise.all([
      fetch(`https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${token}`),
      fetch(`https://us.wio.seeed.io/v1/node/GroveTempHumD0/humidity?access_token=${token}`),
      fetch(`https://us.wio.seeed.io/v1/node/GroveAirqualityA0/quality?access_token=${token}`)
    ]);

    const [tempData, humidityData, qualityData] = await Promise.all([
      tempRes.json(),
      humidityRes.json(),
      qualityRes.json()
    ]);

    return {
      temperature: tempData,
      humidity: humidityData,
      quality: qualityData
    };
  } catch (error) {
    console.error("Failed to load data", error);
    res.status(500).json({ error: "Error while reading data" });
  }
}
