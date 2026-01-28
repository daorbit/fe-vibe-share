import React from "react";
import { Avatar } from "antd";

interface Props {
  avatarUrl?: string;
  size?: number | 'small' | 'default' | 'large';
  className?: string;
}

export default function UserAvatar({ avatarUrl, size = 40, className }: Props) {
  if (!avatarUrl) {
    return <Avatar size={size} className={`bg-secondary ${className || ""}`} />;
  }

  // Otherwise assume URL (Cloudinary uploaded image)
  return <Avatar src={avatarUrl} size={size} className={className} />;
}
