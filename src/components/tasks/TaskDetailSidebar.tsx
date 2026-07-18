"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash, Plus, Palette, Check, AlertCircle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmojiPicker, { Theme } from 'emoji-picker-react';

export function TaskDetailSidebar() {
  const { activeTaskId, setActiveTask } = useUiStore();
  const { tasks, lists, updateTask, deleteTask, moveTask, addTask, updateTaskStatus } = useTaskStore();
  
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const task = tasks.find(t => t.id === activeTaskId);
  const subtasks = tasks.filter(t => t.parentId === activeTaskId);

  React.useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setErrorMsg('');
    }
  }, [task?.title, activeTaskId]);

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      setErrorMsg('Tên phải từ 1 đến 30 ký tự!');
      if (task) setEditTitle(task.title);
      setTimeout(() => setErrorMsg(''), 3000);
    } else {
      if (task) updateTask(task.id, { title: trimmed });
      setErrorMsg('');
    }
  };
  
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() && task) {
      addTask(task.listId, newSubtaskTitle.trim(), task.id);
      setNewSubtaskTitle('');
    }
  };

  const completedSubtasks = subtasks.filter(s => s.status === 'done').length;
  const progress = subtasks.length ? (completedSubtasks / subtasks.length) * 100 : 0;

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
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed z-50 flex flex-col bg-background/95 backdrop-blur-xl shadow-2xl bottom-0 inset-x-0 h-[85vh] rounded-t-2xl border-t border-border/50 md:inset-y-0 md:right-0 md:left-auto md:w-80 md:h-full md:rounded-none md:border-t-0 md:border-l select-none"
          >
            <div className="w-full flex justify-center pt-2 pb-1 md:hidden">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold text-lg">Task Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveTask(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-1">
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className={cn("w-full text-lg font-medium bg-transparent border-b focus:outline-none px-1 py-1", errorMsg ? "border-destructive text-destructive" : "border-transparent focus:border-primary/50")}
                  />
                  {editTitle !== task.title && (
                    <Button size="icon" variant="secondary" onClick={handleSaveTitle} className="shrink-0 h-8 w-8 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </Button>
                  )}
                </div>
                {errorMsg && (
                  <p className="text-xs text-destructive px-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errorMsg}
                  </p>
                )}
              </div>

              <div className="space-y-3 relative">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" /> Task Icon
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md text-xl">
                    {task.icon || '📄'}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    {showEmojiPicker ? 'Close Picker' : 'Choose Emoji'}
                  </Button>
                </div>
                
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 z-50 mt-2 shadow-xl rounded-lg bg-background">
                    <EmojiPicker 
                      theme={Theme.DARK}
                      onEmojiClick={(emoji) => {
                        updateTask(task.id, { icon: emoji.emoji });
                        setShowEmojiPicker(false);
                      }}
                      width={280}
                      height={300}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Move to List</h4>
                <Select value={task.listId} onValueChange={(val) => { if (val) moveTask(task.id, val); }}>
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
                  <h4 className="text-sm font-medium">Sub-tasks</h4>
                  <span className="text-xs text-muted-foreground">{completedSubtasks}/{subtasks.length}</span>
                </div>
                {subtasks.length > 0 && <Progress value={progress} className="h-2" />}
                
                <div className="space-y-2">
                  {subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-3 group bg-muted/30 hover:bg-muted/60 p-2 rounded-md transition-colors border border-transparent hover:border-border/50">
                      <input
                        type="checkbox"
                        checked={st.status === 'done'}
                        onChange={() => updateTaskStatus(st.id, st.status === 'done' ? 'unfinished' : 'done')}
                        className="w-4 h-4 rounded-sm border-primary/50 text-primary focus:ring-primary/50 cursor-pointer"
                      />
                      <span className={`flex-1 text-sm transition-all ${st.status === 'done' ? 'line-through text-muted-foreground opacity-70' : ''}`}>
                        {st.title}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" onClick={() => deleteTask(st.id)}>
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {task.status !== 'done' && (
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a sub-task"
                      className="flex-1 text-sm bg-transparent border-b border-border/50 focus:border-primary focus:outline-none px-1 py-2"
                    />
                    <Button type="submit" size="sm" variant="ghost"><Plus className="w-4 h-4" /></Button>
                  </form>
                )}
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
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger className={cn(buttonVariants({ variant: "destructive" }), "w-full")}>
                  <Trash className="w-4 h-4 mr-2" /> Delete Task
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Task?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => {
                      deleteTask(task.id);
                      setActiveTask(null);
                      setIsDeleteDialogOpen(false);
                    }}>
                      Yes, delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
