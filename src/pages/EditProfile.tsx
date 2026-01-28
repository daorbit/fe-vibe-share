import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { ArrowLeft, Check, Camera, Instagram, Twitter, Youtube, Music, Globe, ChevronDown, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { usersAPI } from "@/lib/api";
import { updateUser } from "@/store/slices/authSlice";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const EditProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(
    currentUser?.avatarUrl?.startsWith('https://res.cloudinary.com/') ? currentUser.avatarUrl : ''
  );
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [socialLinks, setSocialLinks] = useState({
    instagram: currentUser?.socialLinks?.instagram || '',
    twitter: currentUser?.socialLinks?.twitter || '',
    youtube: currentUser?.socialLinks?.youtube || '',
    spotify: currentUser?.socialLinks?.spotify || '',
    website: currentUser?.socialLinks?.website || ''
  });

  const currentAvatarUrl = uploadedImageUrl;
  const hasSocialLinks = Object.values(socialLinks).some(v => v);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const res = await usersAPI.uploadProfilePicture(file);
      setUploadedImageUrl(res.data.imageUrl);
      dispatch(updateUser(res.data.user));
      message.success('Profile picture uploaded!');
    } catch (err: any) {
      message.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!currentUser) return;
    const payload: any = { bio, socialLinks };
    if (username.trim()) payload.username = username.trim();
    
    if (uploadedImageUrl) {
      payload.avatarUrl = uploadedImageUrl;
    }

    try {
      setLoading(true);
      const res = await usersAPI.updateUser(currentUser.id, payload);
      dispatch(updateUser(res.data.user));
      message.success("Profile updated!");
      navigate(`/profile`);
    } catch (err: any) {
      message.error(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const socialInputs = [
    { key: 'instagram', icon: Instagram, placeholder: 'Instagram username', prefix: '@' },
    { key: 'twitter', icon: Twitter, placeholder: 'Twitter username', prefix: '@' },
    { key: 'youtube', icon: Youtube, placeholder: 'YouTube channel URL' },
    { key: 'spotify', icon: Music, placeholder: 'Spotify artist URL' },
    { key: 'website', icon: Globe, placeholder: 'Website URL' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Edit Profile</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSubmit} 
            disabled={loading}
            className="h-9 w-9 text-primary"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/40">
          <div className="relative group">
            <UserAvatar 
              avatarUrl={currentAvatarUrl} 
              size={72} 
              className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium">{currentUser.username}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Change photo'}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4 p-4 bg-card rounded-2xl border border-border/40">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Your username" 
              className="h-11 bg-background border-border/50"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <span className="text-xs text-muted-foreground">{bio.length}/150</span>
            </div>
            <Textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell people about yourself..." 
              maxLength={150}
              rows={3}
              className="resize-none bg-background border-border/50"
            />
          </div>
        </div>

        {/* Social Links - Collapsible */}
        <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
          <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Social Links</p>
                    <p className="text-xs text-muted-foreground">
                      {hasSocialLinks ? 'Connected' : 'Add your social profiles'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  socialOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                {socialInputs.map(({ key, icon: Icon, placeholder, prefix }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      value={socialLinks[key as keyof typeof socialLinks]}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="h-10 bg-background border-border/50 flex-1"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button 
            onClick={onSubmit} 
            disabled={loading}
            className="w-full h-11 rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="w-full h-11 rounded-xl text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
