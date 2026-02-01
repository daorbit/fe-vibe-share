import { PlaylistTemplate, playlistTemplates } from "@/lib/playlistTemplates";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TemplateSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PlaylistTemplate) => void;
}

const TemplateSelectSheet = ({ isOpen, onClose, onSelectTemplate }: TemplateSelectSheetProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[101] animate-in slide-in-from-bottom duration-300">
        <div className="relative bg-background rounded-t-2xl border-t border-border/50 shadow-2xl max-w-lg mx-auto max-h-[80vh] flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div>
              <span className="font-semibold text-base">Choose a Template</span>
              <p className="text-xs text-muted-foreground mt-0.5">Start with a pre-made theme</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {playlistTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="group relative overflow-hidden rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className={`h-32 bg-gradient-to-br ${template.gradient} p-3 flex flex-col justify-between`}>
                    {/* Emoji and Name */}
                    <div>
                      <span className="text-3xl block mb-1">{template.emoji}</span>
                      <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                    </div>
                    
                    {/* Tags Preview */}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Description on hover */}
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs text-center">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectSheet;
