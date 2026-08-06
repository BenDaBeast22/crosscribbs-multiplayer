import { DiscordSDK } from "@discord/embedded-app-sdk";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./app.css";

async function bootstrap() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const isInsideDiscord = window.location.hostname.endsWith("discordsays.com");

  if (clientId && isInsideDiscord) {
    const discordSdk = new DiscordSDK(clientId);
    await discordSdk.ready();
    console.log("Discord SDK ready");
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
  );
}

bootstrap();