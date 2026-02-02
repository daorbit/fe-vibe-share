import { Drawer, Typography, App } from "antd";
import { Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";

const { Text } = Typography;

interface ShareDrawerProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  shareTitle: string;
  shareText?: string;
}

const ShareDrawer = ({
  open,
  onClose,
  shareUrl,
  shareTitle,
  shareText,
}: ShareDrawerProps) => {
  const { message } = App.useApp();
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    message.success("Link copied to clipboard");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareOnPlatform = (platform: string) => {
    const text = shareText || shareTitle;
    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct web sharing, so copy link and show message
        copyLink();
        message.info("Link copied! Share it on Instagram");
        return;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }
    if (url) window.open(url, "_blank");
  };

  return (
    <Drawer
      title={null}
      placement="bottom"
      onClose={onClose}
      open={open}
      height="auto"
      className="share-drawer rounded-t-3xl bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
      closeIcon={null}
      styles={{
        body: { padding: "16px 20px 20px", background: "#1a1a1a" },
      }}
    >
      <div className="">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">{shareTitle}</h3>
        </div>

        {/* Share Link */}
        <div className="mb-4">
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-white/60 truncate">{shareUrl}</p>
            </div>
            <button
              onClick={copyLink}
              className={`p-2 rounded-lg transition-all ${
                linkCopied
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {linkCopied ? (
                <Check className="w-4 h-4" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Share Platforms */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => shareOnPlatform("whatsapp")}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/80">
              WhatsApp
            </span>
          </button>

          <button
            onClick={() => shareOnPlatform("instagram")}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/80">
              Instagram
            </span>
          </button>

          <button
            onClick={() => shareOnPlatform("twitter")}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/80">X</span>
          </button>

          <button
            onClick={() => shareOnPlatform("facebook")}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-white/80">
              Facebook
            </span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default ShareDrawer;
