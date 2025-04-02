// components/RevenueTrendChart.js
import React, { useEffect, useRef } from 'react';
import { CChartLine } from '@coreui/react-chartjs';
import { getStyle } from '@coreui/utils';

const RevenueTrendChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color');
          chartRef.current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color');
          chartRef.current.update();
        });
      }
    });
  }, [chartRef]);

  return (
    <CChartLine
      ref={chartRef}
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels: data.labels, // e.g., ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023"]
        datasets: [
          {
            label: 'Revenue',
            backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
            borderColor: getStyle('--cui-info'),
            pointHoverBackgroundColor: getStyle('--cui-info'),
            borderWidth: 2,
            data: data.values, // e.g., [1000000, 1200000, 1500000, 1300000]
            fill: true,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            grid: {
              color: getStyle('--cui-border-color-translucent'),
              drawOnChartArea: false,
            },
            ticks: {
              color: getStyle('--cui-body-color'),
            },
          },
          y: {
            beginAtZero: true,
            border: {
              color: getStyle('--cui-border-color-translucent'),
            },
            grid: {
              color: getStyle('--cui-border-color-translucent'),
            },
            ticks: {
              color: getStyle('--cui-body-color'),
              maxTicksLimit: 5,
              stepSize: Math.ceil(Math.max(...data.values) / 5),
            },
          },
        },
        elements: {
          line: {
            tension: 0.4,
          },
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3,
          },
        },
      }}
    />
  );
};

export default RevenueTrendChart;