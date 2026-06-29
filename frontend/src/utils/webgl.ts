export function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const contextAttributes: WebGLContextAttributes = {
      antialias: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "high-performance",
    };
    const gl =
      canvas.getContext("webgl2", contextAttributes) ||
      canvas.getContext("webgl", contextAttributes);

    gl?.getExtension("WEBGL_lose_context")?.loseContext();

    return Boolean(gl);
  } catch {
    return false;
  }
}
