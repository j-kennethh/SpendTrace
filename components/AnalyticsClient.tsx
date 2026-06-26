'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Category = {
  id: number
  name: string
  icon: string | null
  monthly_budget: number
}

type Expense = {
  id: number
  amount: number
  description: string | null
  date: string
  category_id: number | null
}

interface AnalyticsClientProps {
  expenses: Expense[]
  categories: Category[]
  currency?: string
  selectedMonthISO: string
}

// Custom Pie Slice path generator
function getPieSlicePath(startPercent: number, endPercent: number, radius = 70, cx = 90, cy = 90) {
  if (endPercent - startPercent >= 0.999) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
  }

  const startAngle = startPercent * 360 - 90
  const endAngle = endPercent * 360 - 90

  const rad1 = (startAngle * Math.PI) / 180
  const rad2 = (endAngle * Math.PI) / 180

  const x1 = cx + radius * Math.cos(rad1)
  const y1 = cy + radius * Math.sin(rad1)
  const x2 = cx + radius * Math.cos(rad2)
  const y2 = cy + radius * Math.sin(rad2)

  const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

export default function AnalyticsClient({
  expenses,
  categories,
  currency = '$',
  selectedMonthISO
}: AnalyticsClientProps) {
  const selectedMonth = useMemo(() => new Date(selectedMonthISO), [selectedMonthISO])
  const y = selectedMonth.getFullYear()
  const m = selectedMonth.getMonth()

  // 1. FILTER EXPENSES FOR SELECTED MONTH (Using timezone-safe string matching)
  const targetMonthStr = `${y}-${String(m + 1).padStart(2, '0')}`
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(targetMonthStr))
  }, [expenses, targetMonthStr])

  const monthlyTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  }, [currentMonthExpenses])

  // 2. PIE CHART DATA AGGREGATION
  const [hoveredPieIdx, setHoveredPieIdx] = useState<number | null>(null)
  const [activeHeatmapDay, setActiveHeatmapDay] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])
  
  const pieData = useMemo(() => {
    const spendByCategory: Record<number, number> = {}
    currentMonthExpenses.forEach((e) => {
      const catId = e.category_id
      if (catId) {
        spendByCategory[catId] = (spendByCategory[catId] || 0) + Number(e.amount)
      }
    })

    const colors = [
      '#6366f1', // Indigo
      '#14b8a6', // Teal
      '#f59e0b', // Amber
      '#ec4899', // Pink/Rose
      '#10b981', // Emerald
    ]

    const data = categories.map((cat, idx) => {
      const amount = spendByCategory[cat.id] || 0
      const percent = monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '📂',
        amount,
        percent,
        color: colors[idx % colors.length]
      }
    }).filter((c) => c.amount > 0)

    // Uncategorized
    const uncategorizedAmount = currentMonthExpenses
      .filter((e) => !e.category_id || !categories.some((c) => c.id === e.category_id))
      .reduce((sum, e) => sum + Number(e.amount), 0)

    if (uncategorizedAmount > 0) {
      data.push({
        id: -1,
        name: 'Uncategorized',
        icon: '❓',
        amount: uncategorizedAmount,
        percent: monthlyTotal > 0 ? (uncategorizedAmount / monthlyTotal) * 100 : 0,
        color: '#6b7280' // Gray
      })
    }

    // Calculate start/end percentages for slices using a pure functional reduce to satisfy eslint constraints
    return data.map((item, idx) => {
      const startPercent = data.slice(0, idx).reduce((sum, prev) => sum + (prev.percent / 100), 0)
      const endPercent = startPercent + (item.percent / 100)
      return {
        ...item,
        startPercent,
        endPercent
      }
    })
  }, [currentMonthExpenses, categories, monthlyTotal])

  // 3. 6-MONTH TREND DATA AGGREGATION
  const [hoveredDot, setHoveredDot] = useState<{ x: number; y: number; label: string; value: number } | null>(null)

  const trendData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - i, 1)
      const monthName = d.toLocaleString('default', { month: 'short' })
      const yearShort = d.getFullYear().toString().slice(-2)
      months.push({
        label: `${monthName} '${yearShort}`,
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      })
    }

    return months.map((tm) => {
      const monthExpenses = expenses.filter((e) => e.date.startsWith(tm.key))
      const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
      return {
        label: tm.label,
        total
      }
    })
  }, [expenses, y, m])

  // 4. CALENDAR HEATMAP DATA AGGREGATION
  const numDays = useMemo(() => new Date(y, m + 1, 0).getDate(), [y, m])
  const startDayOfWeek = useMemo(() => new Date(y, m, 1).getDay(), [y, m])

  const { heatmapData, maxDailySpend } = useMemo(() => {
    const spendByDay: Record<number, number> = {}
    for (let d = 1; d <= numDays; d++) {
      spendByDay[d] = 0
    }
    currentMonthExpenses.forEach((e) => {
      const parts = e.date.split('-')
      const day = Number(parts[2])
      if (!isNaN(day) && day >= 1 && day <= numDays) {
        spendByDay[day] = (spendByDay[day] || 0) + Number(e.amount)
      }
    })

    const max = Math.max(...Object.values(spendByDay), 0)
    return { heatmapData: spendByDay, maxDailySpend: max }
  }, [currentMonthExpenses, numDays])

  // 5. LINE CHART SVG PARAMETERS AND COMPUTATIONS
  const lineChartParams = useMemo(() => {
    const width = 600
    const height = 240
    const paddingLeft = 55
    const paddingRight = 20
    const paddingTop = 25
    const paddingBottom = 40
    
    const contentWidth = width - paddingLeft - paddingRight
    const contentHeight = height - paddingTop - paddingBottom

    const maxSpend = Math.max(...trendData.map((d) => d.total), 10)
    
    // Determine a nice round step size based on max spending
    let step = 10
    if (maxSpend > 10000) step = 5000
    else if (maxSpend > 5000) step = 2000
    else if (maxSpend > 2000) step = 1000
    else if (maxSpend > 1000) step = 500
    else if (maxSpend > 500) step = 200
    else if (maxSpend > 200) step = 100
    else if (maxSpend > 100) step = 50
    else if (maxSpend > 50) step = 25
    else if (maxSpend > 20) step = 10
    else step = 5

    // Calculate rounded yMax as a multiple of step
    const yMax = Math.ceil((maxSpend * 1.05) / step) * step

    // Generate rounded grid values (e.g., [500, 400, 300, 200, 100, 0])
    const gridValues: number[] = []
    for (let val = 0; val <= yMax; val += step) {
      gridValues.push(val)
    }
    gridValues.reverse()

    const points = trendData.map((d, i) => {
      const x = paddingLeft + (i / 5) * contentWidth
      const ratio = d.total / yMax
      const yCoord = (paddingTop + contentHeight) - ratio * contentHeight
      return { x, y: yCoord, label: d.label, value: d.total }
    })

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + contentHeight} L ${points[0].x} ${paddingTop + contentHeight} Z`
      : ''

    return {
      width,
      height,
      paddingLeft,
      paddingTop,
      contentWidth,
      contentHeight,
      yMax,
      points,
      linePath,
      areaPath,
      gridValues
    }
  }, [trendData])

  // Get Shading level class for Heatmap Day
  const getShadingLevel = (amount: number) => {
    if (amount === 0) return 'bg-muted/30 dark:bg-muted/10 text-muted-foreground/60 border border-border/30'
    if (maxDailySpend === 0) return 'bg-primary/20 text-foreground border border-primary/10'
    const ratio = amount / maxDailySpend
    if (ratio <= 0.25) return 'bg-primary/20 dark:bg-primary/20 text-foreground border border-primary/10 hover:bg-primary/30 transition-colors'
    if (ratio <= 0.50) return 'bg-primary/45 dark:bg-primary/40 text-foreground border border-primary/20 hover:bg-primary/55 transition-colors'
    if (ratio <= 0.75) return 'bg-primary/70 dark:bg-primary/65 text-primary-foreground border border-primary/30 hover:bg-primary/80 transition-colors'
    return 'bg-primary/95 dark:bg-primary text-primary-foreground border border-primary/40 hover:bg-primary font-semibold transition-colors'
  }

  return (
    <div className="space-y-6">
      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PIE / DONUT CHART */}
        <Card className="shadow-md border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
            
            {monthlyTotal > 0 ? (
              <>
                {/* SVG Donut */}
                <div className="relative w-44 h-44 flex-shrink-0">
                  <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                    {pieData.map((item, idx) => {
                      const isHovered = hoveredPieIdx === idx
                      const radius = isHovered ? 74 : 70

                      return (
                        <path
                          key={item.id}
                          d={getPieSlicePath(item.startPercent, item.endPercent, radius)}
                          fill={item.color}
                          className="transition-all duration-300 cursor-pointer origin-center"
                          onMouseEnter={() => setHoveredPieIdx(idx)}
                          onMouseLeave={() => setHoveredPieIdx(null)}
                          style={{
                            opacity: hoveredPieIdx === null || isHovered ? 1 : 0.75,
                            transform: isHovered ? 'scale(1.03)' : 'scale(1)'
                          }}
                        />
                      )
                    })}
                    {/* Inner Center Cutout for Donut Chart */}
                    <circle 
                      cx="90" 
                      cy="90" 
                      r="46" 
                      className="fill-card" 
                    />
                  </svg>
                  {/* Center Text displaying sum */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                    <span className="text-lg font-bold truncate max-w-[120px]">{currency}{monthlyTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* Color Legend List */}
                <div className="flex-1 w-full space-y-2.5">
                  {pieData.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between text-sm p-1.5 rounded-md transition-colors ${
                        hoveredPieIdx === idx ? 'bg-secondary/40' : ''
                      }`}
                      onMouseEnter={() => setHoveredPieIdx(idx)}
                      onMouseLeave={() => setHoveredPieIdx(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        <span className="font-medium text-foreground truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <span className="font-bold block">{currency}{item.amount.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{item.percent.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                <svg width="180" height="180" viewBox="0 0 180 180" className="opacity-25 mb-4">
                  <circle cx="90" cy="90" r="70" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="6 6" />
                  <circle cx="90" cy="90" r="46" fill="none" />
                </svg>
                <h3 className="font-semibold text-base text-muted-foreground">No Expense Data</h3>
                <p className="text-xs text-muted-foreground/80 max-w-[220px] mt-1">
                  Add expenses on the dashboard for {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })} to see a breakdown.
                </p>
              </div>
            )}

          </CardContent>
        </Card>

        {/* DAILY HEATMAP GRAPH */}
        <Card className="shadow-md border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Daily Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            
            {/* Calendar Grid Container */}
            <div className="w-full max-w-[320px] space-y-2">
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted-foreground tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
              
              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty Days Before 1st Day */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square w-full rounded bg-transparent" />
                ))}

                {/* Day Blocks */}
                {Array.from({ length: numDays }).map((_, i) => {
                  const day = i + 1
                  const amount = heatmapData[day] || 0
                  const dateLabel = `${selectedMonth.toLocaleString('default', { month: 'short' })} ${day}, ${y}`
                  
                  return (
                    <div 
                      key={`day-${day}`} 
                      className="relative group/day aspect-square w-full"
                      onClick={isMobile ? () => setActiveHeatmapDay((prev) => prev === day ? null : day) : undefined}
                    >
                      <div
                        className={cn(
                          "w-full h-full rounded flex items-center justify-center text-[11px] font-medium transition-all shadow-sm",
                          isMobile ? "cursor-pointer" : "cursor-default",
                          getShadingLevel(amount)
                        )}
                      >
                        {day}
                      </div>

                      {/* Custom floating tooltip matching the line chart */}
                      <div 
                        className={cn(
                          "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-popover/95 backdrop-blur-sm border shadow-lg px-2.5 py-1.5 rounded-md text-[10px] text-popover-foreground flex-col items-center whitespace-nowrap font-medium transition-all duration-150 ease-out",
                          isMobile 
                            ? (activeHeatmapDay === day ? "flex" : "hidden") 
                            : "hidden group-hover/day:flex"
                        )}
                      >
                        <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">{dateLabel}</span>
                        <span className="font-bold text-[11px] mt-0.5">{currency}{amount.toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span>Less</span>
              <span className="w-4 h-4 rounded bg-muted/30 dark:bg-muted/10 border border-border/30" title="No spent" />
              <span className="w-4 h-4 rounded bg-primary/20 border border-primary/10" title="Low spend" />
              <span className="w-4 h-4 rounded bg-primary/45 border border-primary/20" title="Medium spend" />
              <span className="w-4 h-4 rounded bg-primary/70 border border-primary/30" title="High spend" />
              <span className="w-4 h-4 rounded bg-primary/95 border border-primary/40" title="Maximum spend" />
              <span>More</span>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* 6-MONTH TREND CHART */}
      <Card className="shadow-md border-muted">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">6-Month Spending Trend</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          
          <div className="w-full overflow-x-auto select-none pb-2 scrollbar-thin">
            <div className="relative w-full min-w-[500px]">
              <svg 
                viewBox={`0 0 ${lineChartParams.width} ${lineChartParams.height}`} 
                width="100%" 
                height="100%"
                className="overflow-visible w-full h-[200px] md:h-auto"
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {lineChartParams.gridValues.map((value) => {
                  const ratio = value / lineChartParams.yMax
                  const yVal = lineChartParams.paddingTop + lineChartParams.contentHeight * (1 - ratio)
                  return (
                    <g key={`grid-${value}`}>
                      <line 
                        x1={lineChartParams.paddingLeft} 
                        y1={yVal} 
                        x2={lineChartParams.width - 20} 
                        y2={yVal} 
                        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/5"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text 
                        x={lineChartParams.paddingLeft - 10} 
                        y={yVal + 3.5} 
                        textAnchor="end" 
                        className="fill-muted-foreground/80 dark:fill-muted-foreground/50 text-[10px] font-medium"
                      >
                        {currency}{value}
                      </text>
                    </g>
                  )
                })}

                {/* Area Gradient Fill */}
                {lineChartParams.areaPath && (
                  <path 
                    d={lineChartParams.areaPath} 
                    fill="url(#areaGradient)" 
                    className="transition-all duration-500"
                  />
                )}

                {/* Line Stroke */}
                {lineChartParams.linePath && (
                  <path 
                    d={lineChartParams.linePath} 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                )}

                {/* Hover vertical helper line */}
                {hoveredDot && (
                  <line 
                    x1={hoveredDot.x}
                    y1={lineChartParams.paddingTop}
                    x2={hoveredDot.x}
                    y2={lineChartParams.paddingTop + lineChartParams.contentHeight}
                    className="stroke-primary/40 dark:stroke-primary/30"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Data Dots */}
                {lineChartParams.points.map((p, idx) => {
                  const isHovered = hoveredDot?.label === p.label
                  return (
                    <g key={`point-${idx}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? "6.5" : "4.5"}
                        fill="var(--primary)"
                        stroke="var(--background)"
                        strokeWidth="2.5"
                        className="pointer-events-none transition-all duration-200"
                      />
                      {/* X Axis Labels */}
                      <text
                        x={p.x}
                        y={lineChartParams.height - 15}
                        textAnchor="middle"
                        className="fill-muted-foreground/90 dark:fill-muted-foreground/60 text-[10px] font-bold"
                      >
                        {p.label}
                      </text>
                    </g>
                  )
                })}

                {/* Large Invisible Hover Overlay Targets */}
                {lineChartParams.points.map((p, idx) => (
                  <circle
                    key={`hover-target-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r="20"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDot(p)}
                    onMouseLeave={() => setHoveredDot(null)}
                  />
                ))}
              </svg>

              {/* Custom Interactive Floating Tooltip */}
              {hoveredDot && (
                <div 
                  className="absolute z-20 pointer-events-none bg-popover/95 backdrop-blur-sm border shadow-lg px-2.5 py-1.5 rounded-md text-[11px] text-popover-foreground transition-all duration-150 ease-out flex flex-col font-medium"
                  style={{
                    left: `calc(${(hoveredDot.x / lineChartParams.width) * 100}% - 45px)`,
                    top: `calc(${(hoveredDot.y / lineChartParams.height) * 100}% - 55px)`
                  }}
                >
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{hoveredDot.label}</span>
                  <span className="font-bold text-xs">{currency}{hoveredDot.value.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
