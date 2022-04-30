import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import temperatureImg from '../images/temperatur.png'
import humidityImg from '../images/humidity.png'
import qualityImg from '../images/quality.png'
// TODO: add Error handling if wio is offline or data can't be fetched

export default function Home({
  data: { quality, humidity, celsius_degree },
  token
}) {
  const [data, setData] = useState({ quality, humidity, celsius_degree })

  const backgroundColorForQuality = () => {
    let r, g, b
    let quality = data?.quality
    let value

    if (quality > 100) {
      // red high pollution
      r = 255
      g = Math.floor(255 * (50 - (quality % 50) - 50))
      value = 'High Pollution'
    } else if (quality < 68) {
      // red to yellow low pollution
      r = 255
      g = Math.floor(255 * ((50 - (quality % 50)) / 50))
      value = 'Low Pollution'
    } else {
      // green
      r = Math.floor(255 * ((quality % 50) / 50))
      g = 255
      value = 'Fresh Air'
    }
    b = 0

    return { color: `rgb(${r}, ${g}, ${b}, 0.5)`, value }
  }

  const fetchData = async () => {
    const [tempRes, humidityRes, qualityRes] = await Promise.all([
      fetch(
        `https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${token}`
      ),
      fetch(
        `https://us.wio.seeed.io/v1/node/GroveTempHumD0/humidity?access_token=${token}`
      ),
      fetch(
        `https://us.wio.seeed.io/v1/node/GroveAirqualityA0/quality?access_token=${token}`
      )
    ])

    const data = (
      await Promise.all([tempRes.json(), humidityRes.json(), qualityRes.json()])
    ).reduce(
      (item, data) => ({
        ...data,
        ...item
      }),
      {}
    )

    return setData(data)
  }

  let intervalId = useRef()
  useEffect(() => {
    intervalId.current = setInterval(() => {
      fetchData()
    }, 5000)

    return () => {
      clearInterval(intervalId.current)
    }
  })

  const airQuality = backgroundColorForQuality()

  return (
    <div className="summary">
      <div className="grid">
        <div id="temperature" className="sensor-item">
          <div className="heading">
            <Image className="svg-icon" src={temperatureImg} />
            <span className='svg-text'> Temperature </span>
          </div>
          <div>
            <span className="value">{data.celsius_degree}</span>
            <span className="unit">℃</span>
          </div>
        </div>
        <div id="humidity" className="sensor-item">
          <div className="heading">
            <Image className="svg-icon" src={humidityImg} /> 
            <span className='svg-text'> Humidity </span>
          </div>
          <div>
            <span className="value">{data.humidity}</span>
            <span className="unit">%</span>
          </div>
        </div>
        <div id="quality" className="sensor-item">
          <div className="heading">
            <Image className="svg-icon" src={qualityImg} /> 
            <span className='svg-text'>CO2</span>
          </div>
          <div>
            <span className="valueTemp" style={{color: airQuality.color}}>{airQuality.value}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const token = process.env.ACCESS_TOKEN
  const [tempRes, humidityRes, qualityRes] = await Promise.all([
    fetch(
      `https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${token}`
    ),
    fetch(
      `https://us.wio.seeed.io/v1/node/GroveTempHumD0/humidity?access_token=${token}`
    ),
    fetch(
      `https://us.wio.seeed.io/v1/node/GroveAirqualityA0/quality?access_token=${token}`
    )
  ])

  const data = (
    await Promise.all([tempRes.json(), humidityRes.json(), qualityRes.json()])
  ).reduce(
    (item, data) => ({
      ...data,
      ...item
    }),
    {}
  )

  return { props: { data, token } }
}
