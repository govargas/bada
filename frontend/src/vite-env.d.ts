/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_MAPTILER_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SVGR React component types for `?react` imports
declare module "*.svg?react" {
  import * as React from "react";
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
