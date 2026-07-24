import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { GlobalLoadingBar } from "@/shared/components/GlobalLoadingBar";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <AppProviders>
      <GlobalLoadingBar />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}
