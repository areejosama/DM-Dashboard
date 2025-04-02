// components/ProfitsByMainClassChart.js
import React, { useEffect, useRef } from 'react';
import { CChartBar } from '@coreui/react-chartjs';
import { getStyle } from '@coreui/utils';

const ProfitsByMainClassChart = ({ data }) => {
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
    <CChartBar
      ref={chartRef}
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels: data.labels, // e.g., ["Balance Sheet", "Income Statement", "Cash Flow"]
        datasets: [
          {
            label: 'Profits',
            backgroundColor: `rgba(${getStyle('--cui-primary-rgb')}, .6)`,
            borderColor: getStyle('--cui-primary'),
            borderWidth: 1,
            data: data.values, // e.g., [500000, 700000, 300000]
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
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
      }}
    />
  );
};

export default ProfitsByMainClassChart;