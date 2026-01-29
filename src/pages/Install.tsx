import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share, Plus, CheckCircle2, Smartphone, Wifi, Bell } from "lucide-react";
import { Button, Typography } from "antd";
import usePWAInstall from "@/hooks/usePWAInstall";

const { Title, Text } = Typography;

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      // Optionally navigate after install
    }
  };

  const features = [
    { icon: Smartphone, title: "Works Offline", description: "Access your playlists even without internet" },
    { icon: Wifi, title: "Fast & Smooth", description: "Native app-like performance and animations" },
    { icon: Bell, title: "Stay Updated", description: "Get notified about new playlists and likes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Button
            type="text"
            size="small"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="!w-8 !h-8"
          />
          <Title level={5} className="!mb-0 !text-sm">Install App</Title>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="Now Music" className="w-16 h-16" />
          </div>
          <Title level={3} className="!mb-2">Install Now Music</Title>
          <Text type="secondary">Add to your home screen for the best experience</Text>
        </motion.div>

        {/* Status */}
        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center mb-8"
          >
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
            <Title level={4} className="!mb-1">Already Installed!</Title>
            <Text type="secondary">Now Music is installed on your device</Text>
          </motion.div>
        ) : isInstallable ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Button
              type="primary"
              size="large"
              block
              onClick={handleInstall}
              icon={<Download className="w-5 h-5" />}
              className="!h-14 !rounded-2xl !text-base !font-semibold"
            >
              Install Now Music
            </Button>
          </motion.div>
        ) : isIOS ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 rounded-2xl p-6 mb-8"
          >
            <Title level={5} className="!mb-4">Install on iPhone/iPad</Title>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <Text strong className="block">Tap the Share button</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Share className="w-5 h-5 text-primary" />
                    <Text type="secondary" className="text-sm">at the bottom of Safari</Text>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <Text strong className="block">Scroll and tap "Add to Home Screen"</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Plus className="w-5 h-5 text-primary" />
                    <Text type="secondary" className="text-sm">in the action sheet</Text>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <Text strong className="block">Tap "Add" to confirm</Text>
                  <Text type="secondary" className="text-sm">The app will appear on your home screen</Text>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 rounded-2xl p-6 mb-8 text-center"
          >
            <Text type="secondary">
              Open this page in Chrome or Safari on your mobile device to install the app
            </Text>
          </motion.div>
        )}

        {/* Features */}
        <div className="space-y-4">
          <Title level={5} className="!mb-4">Why install?</Title>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Text strong className="block">{feature.title}</Text>
                <Text type="secondary" className="text-sm">{feature.description}</Text>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Install;
