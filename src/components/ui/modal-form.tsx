import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from './drawer';
import { Button } from './button';
import { Card, CardContent } from './card';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalForm({ isOpen, onClose }: ModalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    mode: 'normal',
    duration: ''
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Music form submitted:', { formData, audioFile, coverFile });
    // Handle music upload here
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        setAudioFile(file);
      } else {
        setCoverFile(file);
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[98vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg font-bold text-center">
              Add New Music
            </DrawerTitle>
            <DrawerDescription className="text-center text-xs">
              Upload a new track to your playlist
            </DrawerDescription>
          </DrawerHeader>
          
          <Card className="border-0 shadow-none">
            <CardContent className="p-3">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label htmlFor="title" className="block text-xs font-medium mb-1">
                    Track Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Enter track title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="artist" className="block text-xs font-medium mb-1">
                    Artist
                  </label>
                  <input
                    type="text"
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Enter artist name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mode" className="block text-xs font-medium mb-1">
                    Genre Mode
                  </label>
                  <select
                    id="mode"
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  >
                    <option value="normal">Normal</option>
                    <option value="phonk">Phonk</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-xs font-medium mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Enter duration in seconds"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="audioFile" className="block text-xs font-medium mb-1">
                    Audio File
                  </label>
                  <input
                    type="file"
                    id="audioFile"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, 'audio')}
                    className="w-full px-1 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    required
                  />
                  {audioFile && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Selected: {audioFile.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="coverFile" className="block text-xs font-medium mb-1">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    id="coverFile"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="w-full px-1 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    required
                  />
                  {coverFile && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Selected: {coverFile.name}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1.5"
                  >
                    Add Music
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 text-xs py-1.5"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 