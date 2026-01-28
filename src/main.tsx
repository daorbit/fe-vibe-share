import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ConfigProvider, theme } from "antd";
import { store } from "./store";
import App from "./App.tsx";
import "./index.css";

// Custom dark theme for Ant Design - Warm orange/amber
const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#ea580c",
    colorBgBase: "#0c0f14",
    colorBgContainer: "#12151c",
    colorBgElevated: "#1a1e27",
    colorBorder: "#1f2330",
    colorBorderSecondary: "#1a1e27",
    colorText: "#fafafa",
    colorTextSecondary: "#8b8fa3",
    colorTextTertiary: "#5f6375",
    borderRadius: 8,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  components: {
    Button: {
      primaryShadow: "0 0 16px -4px rgba(234, 88, 12, 0.4)",
      borderRadius: 8,
    },
    Card: {
      colorBgContainer: "#12151c",
    },
    Input: {
      colorBgContainer: "#1a1e27",
      activeBorderColor: "#ea580c",
      borderRadius: 8,
    },
    Modal: {
      contentBg: "#12151c",
      headerBg: "#12151c",
    },
    Tabs: {
      itemSelectedColor: "#ea580c",
      inkBarColor: "#ea580c",
    },
  },
};

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ConfigProvider theme={antdTheme}>
      <App />
    </ConfigProvider>
  </Provider>
);