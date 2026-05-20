import { WebView } from "react-native-webview";

export default function GamesScreen() {
  return (
    <WebView source={{ uri: "https://example.com" }} />
  );
}
