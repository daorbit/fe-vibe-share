import { useNavigate } from "react-router-dom";
import { Button, message, Modal, Typography } from "antd";
import { ArrowLeft, Check, Download, Palette, Shield, Trash2, Volume2, Sparkles } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSoundEnabled } from "@/store/slices/uiSlice";
import useTheme, { themes, ThemeColor } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import usePWAInstall from "@/hooks/usePWAInstall";
import { useState } from "react";

const { Title, Text } = Typography;

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const soundEnabled = useAppSelector((s) => s.ui.soundEnabled);
  const { theme, setTheme, customColor, setCustomColor } = useTheme();
  const { isInstallable, isInstalled } = usePWAInstall();
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleChangePassword = () => {
    message.info("Change password coming soon!");
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Delete account",
      content: "This action is irreversible. Are you sure?",
      okType: "danger",
      onOk: async () => {
        message.info("Account deletion coming soon!");
      },
    });
  };

  if (!currentUser) return null;

  const themeColors = Object.entries(themes).filter(([key]) => key !== 'custom') as [ThemeColor, typeof themes.orange][];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 h-12 max-w-lg mx-auto">
          <Button type="text" size="small" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />} className="!w-8 !h-8" />
          <Title level={5} className="!mb-0 !text-sm">Settings</Title>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Theme Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <Text strong className="text-sm">Theme</Text>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {themeColors.map(([key, config]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  theme === key 
                    ? 'bg-primary/10 ring-2 ring-primary' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${config.primary}, ${config.accent})` }}
                />
                <Text className="text-[10px]">{config.name}</Text>
                {theme === key && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Custom Color Picker */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">Custom Color</Text>
              </div>
              {theme === 'custom' && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Check className="w-3 h-3" />
                  <span>Active</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                style={{ padding: '2px' }}
              />
              <div className="flex-1">
                <Text className="block text-sm">Choose your own accent color</Text>
                <Text type="secondary" className="text-xs">Pick any color to personalize your experience</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Sound Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            <Text strong className="text-sm">Sound</Text>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="block text-sm">Button Click Sounds</Text>
                <Text type="secondary" className="text-xs">Play sounds on button interactions</Text>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={(checked) => dispatch(setSoundEnabled(checked))}
              />
            </div>
        </div>

        {/* Install App Section */}
        {!isInstalled && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <Text strong className="text-sm">Install App</Text>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="block text-sm">Add to Home Screen</Text>
                  <Text type="secondary" className="text-xs">Install the app for a better experience</Text>
                </div>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => navigate('/install')}
                  className="!rounded-[10px] !h-8"
                >
                  {isInstallable ? 'Install' : 'Learn More'}
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Account Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <Text strong className="text-sm">Account</Text>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
            <div>
              <Text type="secondary" className="text-xs">Email</Text>
              <Text className="block text-sm">{currentUser?.email || "—"}</Text>
            </div>
            <Button size="small" onClick={handleChangePassword} className="!rounded-[10px] !h-8">
              Change Password
            </Button>
          </div>
        </div>

   
      </div>
    </div>
  );
};

export default Settings;
