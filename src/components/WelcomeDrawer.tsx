import { useEffect, useState } from "react";
import { X, Music2, Users, Heart, Share2, ArrowRight, ArrowLeft, Home, User, Plus, Search, Settings, Palette, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeDrawer = ({ isOpen, onClose }: WelcomeDrawerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 7;

  const handleClose = () => {
    onClose();
    setCurrentStep(0); // Reset to first step when closing
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
      localStorage.setItem("hasSeenWelcome", "true");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-background/95 backdrop-blur-xl rounded-t-3xl shadow-2xl max-w-lg mx-auto border-t border-border/50 relative overflow-hidden">
          {/* Background Music Icons */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute top-8 right-12 transform rotate-12 animate-[float_6s_ease-in-out_infinite]">
              <Music2 className="w-32 h-32" />
            </div>
            <div className="absolute bottom-16 left-8 transform -rotate-12 animate-[float_8s_ease-in-out_infinite_2s]">
              <Music2 className="w-24 h-24" />
            </div>
            <div className="absolute top-32 left-16 transform rotate-45 animate-[float_7s_ease-in-out_infinite_1s]">
              <Heart className="w-20 h-20" />
            </div>
            <div className="absolute bottom-32 right-16 transform -rotate-45 animate-[float_9s_ease-in-out_infinite_3s]">
              <Users className="w-16 h-16" />
            </div>
          </div>
          
          {/* Glassy gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-pink-500/[0.02] pointer-events-none" />
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors z-[100]"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="px-4 py-6 max-h-[80vh] overflow-y-auto relative z-10">
            {/* Step 1: Feed Page */}
            {currentStep === 0 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Home className="w-6 h-6 text-purple-500" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Feed - Your Music Hub</h2>
                  <p className="text-muted-foreground text-xs">
                    Discover what everyone is sharing
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Latest Playlists</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        See newest playlists from your network and community
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Like & Save</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Quick access to like and save playlists you love
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Community Feed</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Infinite scroll through curated music collections
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Profile Page */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Your Profile</h2>
                  <p className="text-muted-foreground text-xs">
                    Manage your music identity
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Your Playlists</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        All your created playlists in one place
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Saved Collection</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Quick access to your favorite saved playlists
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Social Stats</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Track your followers, following, and engagement
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Create Page */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Create Playlists</h2>
                  <p className="text-muted-foreground text-xs">
                    Build your perfect music collection
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Multi-Platform Support</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Add songs from YouTube, Spotify, Apple Music & SoundCloud
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Palette className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Custom Cover & Tags</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Personalize with gradients, images, and hashtags
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Easy Sharing</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Share your creations with the community instantly
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Search Page */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Search className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Search & Discover</h2>
                  <p className="text-muted-foreground text-xs">
                    Find exactly what you're looking for
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Universal Search</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Search users, playlists, and tags all in one place
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Trending Tags</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Explore popular music genres and moods
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Find New Friends</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Discover users with similar music taste
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Settings Page */}
            {currentStep === 4 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-gray-400" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Settings & Preferences</h2>
                  <p className="text-muted-foreground text-xs">
                    Customize your experience
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Edit Profile</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Update bio, avatar, and social links
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Palette className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Theme Options</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Switch between light and dark modes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Notifications</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Control your notification preferences
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Theming Features */}
            {currentStep === 5 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Theming & Customization</h2>
                  <p className="text-muted-foreground text-xs">
                    Make VibeShare truly yours
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Palette className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Dark & Light Themes</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Choose the theme that suits your vibe
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Gradient Covers</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Beautiful gradient options for playlists
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Personalization</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Custom avatars and profile styling
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 7: Additional Features */}
            {currentStep === 6 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">More Features</h2>
                  <p className="text-muted-foreground text-xs">
                    Everything you need for music sharing
                  </p>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Easy Sharing</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Share playlists across social platforms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Like & Comment</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Engage with the community's playlists
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5 text-xs">Follow System</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Build connections with music lovers
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-foreground"
                      : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrev}
                  className="h-10 text-sm font-semibold border-2 border-border bg-transparent hover:bg-secondary transition-colors px-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`h-10 text-sm font-semibold border-2 border-border bg-transparent hover:bg-secondary transition-colors ${currentStep > 0 ? 'flex-1' : 'w-full'}`}
              >
                {currentStep === totalSteps - 1 ? (
                  "Get Started"
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeDrawer;
