// Layout macro is metadata only — filtered out before rendering in SlideRenderer.
// This renderer is a no-op fallback (layout macros should never reach here in slides).
import type { MacroComponentProps } from "@macros/componentTypes";
import type { LayoutMacro } from "./types";

type Props = MacroComponentProps<LayoutMacro>;

export default function LayoutRenderer(_: Props) {
  return null;
}
