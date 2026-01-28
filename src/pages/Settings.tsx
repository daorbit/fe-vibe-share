import { useNavigate } from "react-router-dom";
import { Button, message, Modal, Typography } from "antd";
import { ArrowLeft, Check, Palette, Shield, Trash2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import useTheme, { themes, ThemeColor } from "@/hooks/useTheme";

const { Title, Text } = Typography;

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);
  const { theme, setTheme } = useTheme();

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

  const themeColors = Object.entries(themes) as [ThemeColor, typeof themes.orange][];

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

        {/* Danger Zone */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            <Text strong className="text-sm text-destructive">Danger Zone</Text>
          </div>
          <Button size="small" danger onClick={handleDeleteAccount} className="!rounded-[10px] !h-8">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
