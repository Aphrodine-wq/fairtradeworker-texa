/**
 * TASKS - Tasks Module
 * Task management and to-do lists
 */

import { useState } from 'react'
import { CheckCircle, Circle, Plus, Trash, ListChecks } from '@phosphor-icons/react'

interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: number
  createdAt: number
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  
  const addTask = () => {
    if (!newTaskTitle.trim()) return
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      createdAt: Date.now(),
    }
    
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
  }
  
  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })
  
  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  
  return (
    <div className="void-module void-module-tasks">
      <div className="void-module-header">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="void-module-title">TASKS</h2>
            <p className="void-module-description">Task management and to-do lists</p>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount}/{totalCount}
              </span>
            )}
            <button className="void-module-action-button">
              <ListChecks size={20} weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div className="void-module-content">
        {/* Add Task */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTask()
              }
            }}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={20} weight="bold" />
            Add
          </button>
        </div>
        
        {/* Filters */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'active' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'completed' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Completed
          </button>
        </div>
        
        {/* Tasks List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <ListChecks size={48} className="mx-auto mb-2 opacity-50" />
              <p>{filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}</p>
              {filter === 'all' && <p className="text-sm">Add a task above to get started</p>}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`
                  flex items-center gap-3 p-3 rounded border transition-all
                  ${task.completed 
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle size={24} weight="fill" className="text-green-500" />
                  ) : (
                    <Circle size={24} className="text-gray-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`
                    ${task.completed ? 'line-through text-gray-500' : ''}
                  `}>
                    {task.title}
                  </p>
                  {task.priority === 'high' && (
                    <span className="text-xs text-red-500">High Priority</span>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
