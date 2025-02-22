'use client'
import { useState, useEffect } from 'react'

const CodingForTimer = () => {
    const calculateTimeDifference = () => {
        const startDate = new Date('2018-02-01')
        const now = new Date()

        // Calculate years
        let years = now.getFullYear() - startDate.getFullYear()
        let months = now.getMonth() - startDate.getMonth()

        // Adjust years and months
        if (months < 0) {
            years--
            months += 12
        }

        // Calculate remaining time
        const tempDate = new Date(startDate)
        tempDate.setFullYear(tempDate.getFullYear() + years)
        tempDate.setMonth(tempDate.getMonth() + months)
        
        const difference = now - tempDate

        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        // Convert years and months to digits
        const yearsStr = years.toString()
        const yearsDigits = yearsStr.split('').map(Number)
        const monthsStr = months.toString()
        const monthsDigits = monthsStr.split('').map(Number)
        const daysStr = days.toString()
        const daysDigits = daysStr.split('').map(Number)

        console.log({daysDigits, monthsDigits, yearsDigits})

        return { yearsDigits, monthsDigits, daysDigits, hours, minutes, seconds }
    }

    const [timeElapsed, setTimeElapsed] = useState(calculateTimeDifference())

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(calculateTimeDifference())
        }, 10000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="flex gap-5 items-baseline">
            <div className="flex items-baseline">
                {timeElapsed.yearsDigits.map((digit, index) => (
                    <span key={index} className="countdown font-mono text-4xl">
                        <span style={{ "--value": digit }}></span>
                    </span>
                ))}
                <span className="ml-2">years</span>
            </div>
            <div className="flex items-baseline">
                {timeElapsed.monthsDigits.map((digit, index) => (
                    <span key={index} className="countdown font-mono text-4xl">
                        <span style={{ "--value": digit }}></span>
                    </span>
                ))}
                <span className="ml-2">months</span>
            </div>
        </div>
    )
}

export default CodingForTimer
