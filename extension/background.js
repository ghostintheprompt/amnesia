chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "amnesia-scrub-image",
    title: "Send to Amnesia Scrubber",
    contexts: ["image"]
  });
  chrome.contextMenus.create({
    id: "amnesia-scrub-page",
    title: "Scrub Current Page",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const amnesiaUrl = "http://localhost:3000";
  
  if (info.menuItemId === "amnesia-scrub-image") {
    const targetUrl = info.srcUrl;
    chrome.tabs.create({ url: `${amnesiaUrl}/?url=${encodeURIComponent(targetUrl)}` });
  } else if (info.menuItemId === "amnesia-scrub-page") {
    const targetUrl = info.pageUrl;
    chrome.tabs.create({ url: `${amnesiaUrl}/?url=${encodeURIComponent(targetUrl)}` });
  }
});

chrome.action.onClicked.addListener((tab) => {
  const amnesiaUrl = "http://localhost:3000";
  if (tab.url) {
    chrome.tabs.create({ url: `${amnesiaUrl}/?url=${encodeURIComponent(tab.url)}` });
  }
});
