"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText } from "lucide-react"
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const barData = {
  labels: ['DOT', 'Banks', 'Payment Gateways', 'Social Media'],
  datasets: [
    {
      label: 'Response Time (Days)',
      data: [5, 3, 4, 6],
      backgroundColor: [
        '#4fd1c5',
        '#f6ad55',
        '#f56565',
        '#e2e8f0'
      ],
      borderRadius: 8,
    },
  ],
}

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  animation: {
    duration: 1200,
    easing: 'easeOutBounce' as const,
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}

const doughnutData = {
  labels: ['Message Classification', 'Decoy Chats', 'Form Generation', 'Email Workflow'],
  datasets: [
    {
      data: [25, 25, 25, 25],
      backgroundColor: [
        '#4fd1c5',
        '#f6ad55',
        '#f56565',
        '#e2e8f0'
      ],
      borderWidth: 2,
    },
  ],
}

const doughnutOptions = {
  responsive: true,
  cutout: '70%',
  plugins: {
    legend: { position: "bottom" as const },
    tooltip: { enabled: true },
  },
  animation: {
    animateRotate: true,
    duration: 1400,
    easing: 'easeInOutCubic' as const,
  },
}

export function Analytics() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics & Reporting</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time by Agency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Bar data={barData} options={barOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
