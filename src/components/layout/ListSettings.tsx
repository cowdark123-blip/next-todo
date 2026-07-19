"use client"
import React, { useState, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings2, Trash, Palette, Type, Upload, Check, AlertCircle, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, fileToBase64 } from '@/lib/utils';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface ListSettingsProps {
  listId: string;
}

export function ListSettings({ listId }: ListSettingsProps) {
  const { lists, updateList, updateListSettings, deleteList } = useTaskStore();
  const router = useRouter();
  const list = lists.find(l => l.id === listId);
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (list) {
      setEditName(list.name);
      setErrorMsg('');
    }
  }, [list?.name, isOpen]);

  if (!list) return null;

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      setErrorMsg('Tên phải từ 1 đến 30 ký tự!');
      setEditName(list.name);
      setTimeout(() => setErrorMsg(''), 3000);
    } else {
      updateList(listId, { name: trimmed });
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    deleteList(listId);
    router.push('/');
    setIsOpen(false);
    setIsDeleteDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size > 2 * 1024 * 1024) {
          setErrorMsg('Vui lòng chọn ảnh < 2MB để tránh lỗi bộ nhớ!');
          return;
        }
        const base64 = await fileToBase64(file);
        updateListSettings(listId, { background: base64 });
        // Keep the settings popover open after successful upload
        setIsOpen(true);
      } catch (error) {
        console.error("Error converting file to base64", error);
        setErrorMsg('Không thể upload ảnh này');
      }
    }
  };

  return (
    <>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => {
          handleFileUpload(e);
          e.target.value = '';
        }} 
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-foreground hover:text-foreground")}>
        <MoreHorizontal className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className={cn("p-4 transition-all duration-200", showEmojiPicker ? "w-[400px]" : "w-80")} align="end">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <h4 className="font-medium leading-none mb-4">List Settings</h4>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> List Name
            </label>
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className={cn("w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2", errorMsg ? "border-destructive focus:ring-destructive/50" : "border-border focus:ring-primary/50")}
              />
              <Button size="icon" onClick={handleSaveName} variant="secondary" className="shrink-0">
                <Check className="w-4 h-4" />
              </Button>
            </div>
            {errorMsg && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errorMsg}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-2 relative">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <span>Icon (Emoji)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md text-xl">
                {list.icon || '📁'}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                {showEmojiPicker ? 'Close Picker' : 'Choose Emoji'}
              </Button>
            </div>
            
            {showEmojiPicker && (
              <div className="mt-2 w-full flex justify-center">
                <EmojiPicker 
                  theme={Theme.DARK}
                  onEmojiClick={(emoji) => {
                    updateListSettings(listId, { icon: emoji.emoji });
                    setShowEmojiPicker(false);
                  }}
                  width="100%"
                  height={320}
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> Background Theme
            </div>
            <div className="flex flex-wrap gap-2">
              {['transparent', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#6366f1'].map((c) => (
                <button
                  key={c}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none",
                    list.background === c ? "border-primary" : "border-transparent",
                    c === 'transparent' ? 'border-border bg-muted/50' : ''
                  )}
                  style={{ backgroundColor: c === 'transparent' ? undefined : c }}
                  onClick={() => updateListSettings(listId, { background: c })}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-xs font-medium text-muted-foreground flex justify-between">
              <span>Background Opacity</span>
              <span>{Math.round((list.bgOpacity ?? 1) * 100)}%</span>
            </label>
            <Slider
              value={[list.bgOpacity ?? 1]}
              max={1}
              step={0.01}
              onValueChange={(val: any) => {
                const newValue = Array.isArray(val) ? val[0] : val;
                updateListSettings(listId, { bgOpacity: newValue });
              }}
            />
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger className={cn(buttonVariants({ variant: "destructive" }), "w-full")}>
                <Trash className="w-4 h-4 mr-2" />
                Delete List
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the list "{list.name}" and all of its tasks.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete}>Yes, delete list</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </>
  );
}
