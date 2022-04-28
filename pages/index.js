import React, { useRef, useState, useEffect } from 'react'
import { Grid, Paper } from '@mui/material'

export default function Home({ temp, hum, aq, token }) {
  const [data, setData] = useState({ temp, hum, aq })

  const backgroundColorForQuality = () => {
    let r, g, b
    let quality = data.aq.quality

    if (quality > 70) {
      // green
      r = Math.floor(255 * ((quality % 50) / 50))
      g = 255
    } else if (quality < 70) {
      // green to yellow
      r = Math.floor(255 * (quality / 50))
      g = 255
    } else {
      // yellow to red
      r = 255
      g = Math.floor(255 * ((50 - (quality % 50)) / 50))
    }
    b = 0
    return `rgb(${r}, ${g}, ${b}, 0.5)`
  }

  const fetchData = async () => {
    // Fetch data from external API
    const temperature = await fetch(
      `https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${token}`
    )
    const temp = await temperature.json()

    const humidity = await fetch(
      `https://us.wio.seeed.io/v1/node/GroveTempHumD0/humidity?access_token=${token}`
    )
    const hum = await humidity.json()

    const airQuality = await fetch(
      `https://us.wio.seeed.io/v1/node/GroveAirqualityA0/quality?access_token=${token}`
    )
    const aq = await airQuality.json()

    return setData({ temp, hum, aq })
  }

  let intervalId = useRef()
  useEffect(() => {
    intervalId.current = setInterval(() => {
      //assign interval to a variaable to clear it
      fetchData()
    }, 5000)

    return () => {
      clearInterval(intervalId.current)
    }
  })

  return (
    <Grid
      sx={{
        flexGrow: 1,
        position: 'fixed',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#d7f7f4'
      }}
      container
      spacing={4}
    >
      <Grid key={1} item>
        <h2 style={{ textAlign: 'center' }}> Temperature </h2>
        <Paper
          sx={{
            height: 340,
            width: 300,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            zIndex: '-1',
            backgroundColor: 'rgb(44, 106, 213, 0.1)'
          }}
        >
          <p style={{ fontSize: '75px' }}>{data.temp.celsius_degree} ° </p>
        </Paper>
      </Grid>
      <Grid key={2} item>
        <h2 style={{ textAlign: 'center' }}> Air quality </h2>
        <Paper
          sx={{
            height: 340,
            width: 300,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            backgroundColor: backgroundColorForQuality()
          }}
        >
          <p style={{ fontSize: '75px' }}>{data.aq.quality} %</p>
        </Paper>
      </Grid>
      <Grid key={3} item>
        <h2 style={{ textAlign: 'center' }}> Air humidity </h2>
        <Paper
          sx={{
            height: 340,
            width: 300,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            backgroundColor: 'rgb(44, 106, 213, 0.1)'
          }}
        >
          <p style={{ fontSize: '75px' }}>{data.hum.humidity} % </p>
        </Paper>
      </Grid>
    </Grid>
  )
}

export async function getServerSideProps() {
  const token = process.env.ACCESS_TOKEN
  // Fetch data from external API
  const temperature = await fetch(
    `https://us.wio.seeed.io/v1/node/GroveTempHumD0/temperature?access_token=${token}`
  )
  const temp = await temperature.json()

  const humidity = await fetch(
    `https://us.wio.seeed.io/v1/node/GroveTempHumD0/humidity?access_token=${token}`
  )
  const hum = await humidity.json()

  const airQuality = await fetch(
    `https://us.wio.seeed.io/v1/node/GroveAirqualityA0/quality?access_token=${token}`
  )
  const aq = await airQuality.json()

  return { props: { temp, hum, aq, token } }
}
