export function ThemeScript() {
  const script = `
    (function () {
      try {
        var path = window.location.pathname;
        var isAuthPage = path === "/login" || path === "/register" || path.indexOf("/auth") === 0;
        var stored = localStorage.getItem("noder-theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (!isAuthPage && (stored === "dark" || (!stored && prefersDark))) {
          document.documentElement.classList.add("dark-mode");
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
