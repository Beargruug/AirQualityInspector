export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const token = process.env.ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "API token nicht gesetzt" });
    }

    const [tempRes, humidityRes, qualityRes] = await Promise.all([
      fetch(`https://cn.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${token}`),
      fetch(`https://cn.wio.seeed.io/v1/node/GroveTempHumD0/humidity?access_token=${token}`),
      fetch(`https://cn.wio.seeed.io/v1/node/GroveAirqualityA0/quality?access_token=${token}`)
    ]);

    const [tempData, humidityData, qualityData] = await Promise.all([
      tempRes.json(),
      humidityRes.json(),
      qualityRes.json()
    ]);
      console.log('qualityData:', qualityData);
      console.log('humidityData:', humidityData);
      console.log('tempData:', tempData);

    res.status(200).json({
      temperature: tempData,
      humidity: humidityData,
      quality: qualityData
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Daten" });
  }
}
