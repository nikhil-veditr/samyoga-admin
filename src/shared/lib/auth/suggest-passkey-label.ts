/** Human-readable passkey label from UA / platform (e.g. "Mac · Safari", "iPhone · Chrome"). */
export function suggestPasskeyLabel(userAgent: string, platform = ""): string {
  const ua = userAgent.toLowerCase();
  const plat = platform.toLowerCase();

  let device = "This device";
  if (/iphone/.test(ua) || plat.includes("iphone")) {
    device = "iPhone";
  } else if (/ipad/.test(ua) || plat.includes("ipad")) {
    device = "iPad";
  } else if (/mac/.test(ua) || plat.includes("mac")) {
    device = "Mac";
  } else if (/android/.test(ua)) {
    device = "Android";
  } else if (/win/.test(ua) || plat.includes("win")) {
    device = "Windows";
  } else if (/linux/.test(ua) || plat.includes("linux")) {
    device = "Linux";
  }

  let browser = "";
  if (/edg\//.test(ua)) {
    browser = "Edge";
  } else if (/firefox\//.test(ua)) {
    browser = "Firefox";
  } else if (/chrome\//.test(ua) || /crios\//.test(ua)) {
    browser = "Chrome";
  } else if (/safari\//.test(ua) && !/chrome\//.test(ua) && !/crios\//.test(ua)) {
    browser = "Safari";
  }

  return browser ? `${device} · ${browser}` : device;
}

export function getSuggestedPasskeyLabel(): string {
  if (typeof navigator === "undefined") return "";
  return suggestPasskeyLabel(navigator.userAgent, navigator.platform);
}

export function subscribeSuggestedPasskeyLabel(): () => void {
  return () => {};
}

export function getSuggestedPasskeyLabelServerSnapshot(): string {
  return "";
}
