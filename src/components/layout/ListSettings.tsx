"use client"
import React, { useState, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings2, Trash, Image as ImageIcon, Type, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!list) return null;

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
        const base64 = await fileToBase64(file);
        updateListSettings(listId, { background: base64 });
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground hover:text-foreground")}>
        <Settings2 className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <h4 className="font-medium leading-none mb-4">List Settings</h4>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> List Name
            </label>
            <input
              type="text"
              value={list.name}
              onChange={(e) => updateList(listId, { name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
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
              <div className="absolute top-full left-0 z-50 mt-2 shadow-xl rounded-lg bg-background">
                <EmojiPicker 
                  theme={Theme.DARK}
                  onEmojiClick={(emoji) => {
                    updateListSettings(listId, { icon: emoji.emoji });
                    setShowEmojiPicker(false);
                  }}
                  width={280}
                  height={300}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Background URL / Color
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={list.background || ''}
                onChange={(e) => updateListSettings(listId, { background: e.target.value })}
                placeholder="#ff0000 or https://..."
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <Button variant="outline" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
              </Button>
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
  );
}
