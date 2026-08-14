export function subscribeToSearchHistory(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("search-history-updated", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("search-history-updated", onStoreChange);
  };
}

export function getSearchHistorySnapshot() {
  return localStorage.getItem("searchHistory") || "[]";
}

export function getSearchHistoryServerSnapshot() {
  return "[]";
}