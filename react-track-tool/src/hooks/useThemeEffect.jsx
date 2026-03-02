import { useEffect } from "react";
import { useStore } from "../store/useStore";

export function useThemeEffect() {
  const theme = useStore(state => state.theme);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
}