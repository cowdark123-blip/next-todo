"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash, Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AVAILABLE_ICONS = ['Circle', 'CheckCircle', 'Star', 'Heart', 'Coffee', 'Briefcase', 'AlertCircle', 'Zap'];

export function TaskDetailSidebar() {
  const { activeTaskId, setActiveTask } = useUiStore();
  const { tasks, lists, updateTask, deleteTask, addStep, toggleStep, deleteStep, moveTask } = useTaskStore();
  
  const [newStepTitle, setNewStepTitle] = useState('');

  const task = tasks.find(t => t.id === activeTaskId);
  
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStepTitle.trim() && task) {
      addStep(task.id, newStepTitle.trim());
      setNewStepTitle('');
    }
  };

  const completedSteps = task?.steps.filter(s => s.isCompleted).length || 0;
  const progress = task?.steps.length ? (completedSteps / task.steps.length) * 100 : 0;

  return (
    <AnimatePresence>
      {activeTaskId && task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setActiveTask(null)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold text-lg">Task Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveTask(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <input
                type="text"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className="w-full text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 px-1"
              />

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" /> Task Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => updateTask(task.id, { icon })}
                      className={`p-2 rounded-md border text-xs text-center transition-colors ${
                        task.icon === icon 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Move to List</h4>
                <Select value={task.listId} onValueChange={(val) => moveTask(task.id, val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select list" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map(list => (
                      <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Steps</h4>
                  <span className="text-xs text-muted-foreground">{completedSteps}/{task.steps.length}</span>
                </div>
                {task.steps.length > 0 && <Progress value={progress} className="h-2" />}
                
                <div className="space-y-2">
                  {task.steps.map(step => (
                    <div key={step.id} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={step.isCompleted}
                        onChange={() => toggleStep(task.id, step.id)}
                        className="w-4 h-4 rounded-sm border-primary text-primary focus:ring-primary"
                      />
                      <span className={`flex-1 text-sm ${step.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteStep(task.id, step.id)}>
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddStep} className="flex gap-2">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Next step"
                    className="flex-1 text-sm bg-transparent border-b border-border/50 focus:border-primary focus:outline-none px-1 py-2"
                  />
                  <Button type="submit" size="sm" variant="ghost"><Plus className="w-4 h-4" /></Button>
                </form>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <textarea 
                  value={task.notes || ''}
                  onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                  placeholder="Add some details..."
                  className="w-full h-32 p-3 text-sm rounded-lg bg-muted/50 border-none resize-none focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border/50">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  deleteTask(task.id);
                  setActiveTask(null);
                }}
              >
                <Trash className="w-4 h-4 mr-2" /> Delete Task
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
