/**
 * CALENDAR - Calendar Module
 * Schedule management and calendar view
 */

import { useState } from 'react'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from '@phosphor-icons/react'

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }
  
  return (
    <div className="void-module void-module-calendar">
      <div className="void-module-header">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="void-module-title">CALENDAR</h2>
            <p className="void-module-description">Schedule and appointments</p>
          </div>
          <button className="void-module-action-button">
            <Plus size={20} weight="bold" />
          </button>
        </div>
      </div>
      <div className="void-module-content">
        <div className="calendar-controls mb-4 flex items-center justify-between">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button 
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Today
            </button>
          </div>
          <button 
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-weekdays grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="calendar-days grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isToday = day === new Date().getDate() && 
                            currentDate.getMonth() === new Date().getMonth() &&
                            currentDate.getFullYear() === new Date().getFullYear()
              
              return (
                <div
                  key={index}
                  className={`
                    calendar-day p-2 min-h-[60px] border border-gray-200 dark:border-gray-700 rounded
                    ${day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                    ${isToday ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : ''}
                  `}
                >
                  {day && (
                    <div className={`text-sm ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                      {day}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <h4 className="font-semibold mb-2">Upcoming Events</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>No events scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
