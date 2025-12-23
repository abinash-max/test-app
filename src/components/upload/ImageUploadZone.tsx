import { useState, useCallback } from "react";
import { Upload, Link, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
  label: string;
  onImageChange: (image: string | null) => void;
  image: string | null;
}

const ImageUploadZone = ({ label, onImageChange, image }: ImageUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onImageChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onImageChange]);

  const handleUrlSubmit = useCallback(() => {
    if (urlValue.trim()) {
      onImageChange(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    }
  }, [urlValue, onImageChange]);

  const handleRemove = useCallback(() => {
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      {image ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-border bg-card shadow-soft animate-scale-in">
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-smooth"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-smooth cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="p-3 rounded-full bg-accent">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your image here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
          </div>
        </div>
      )}

      {!image && (
        <div className="space-y-2">
          {showUrlInput ? (
            <div className="flex gap-2 animate-fade-in">
              <Input
                type="url"
                placeholder="Paste image URL..."
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleUrlSubmit}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUrlInput(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowUrlInput(true)}
            >
              <Link className="h-4 w-4" />
              Or paste image URL
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;
