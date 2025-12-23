import { useState, useCallback } from "react";
import { Package, X, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProductUploadZoneProps {
  onProductChange: (product: string | null) => void;
  product: string | null;
}

const ProductUploadZone = ({ onProductChange, product }: ProductUploadZoneProps) => {
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
          onProductChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onProductChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onProductChange(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onProductChange]);

  const handleUrlSubmit = useCallback(() => {
    if (urlValue.trim()) {
      onProductChange(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    }
  }, [urlValue, onProductChange]);

  const handleRemove = useCallback(() => {
    onProductChange(null);
  }, [onProductChange]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Product Image</label>
      
      {product ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-card shadow-soft animate-scale-in">
          <img
            src={product}
            alt="Product"
            className="w-full h-48 object-contain bg-secondary/30 p-4"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-smooth"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-medium">
            Product
          </div>
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
              : "border-primary/30 hover:border-primary/60 hover:bg-primary/5 bg-primary/5"
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="p-3 rounded-full bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Upload your product
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drop image or click to browse
              </p>
            </div>
          </div>
        </div>
      )}

      {!product && (
        <div className="space-y-2">
          {showUrlInput ? (
            <div className="flex gap-2 animate-fade-in">
              <Input
                type="url"
                placeholder="Paste product image URL..."
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
              className="w-full border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setShowUrlInput(true)}
            >
              <Link className="h-4 w-4" />
              Or paste product URL
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductUploadZone;
