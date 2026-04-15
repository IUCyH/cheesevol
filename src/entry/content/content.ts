import channelParser from "../../feature/parser/channelParser";
import rootElementParser from "../../feature/parser/rootElementParser";
import volumeManager from "../../feature/volume/volumeManager";

const allowUrls = ["chzzk.naver.com/live", "chzzk.naver.com/video"];
let isInitialized = false;
let currentUrl = location.href;

async function init() {
    const rootElements = await rootElementParser.parseRootElements();
    const channel = await channelParser.parseChannel(rootElements.informationDetail);
    await volumeManager.initVolume(channel, rootElements);

    console.log("CheeseVol initialized");
}

function isAllowUrl(url: string) {
    return allowUrls.some(allowedUrl => url.includes(allowedUrl));
}

if (!isInitialized) {
    isInitialized = true;
    currentUrl = location.href; // 혹시 모를 버그 방지를 위해 명시적으로 다시 초기화

    if (isAllowUrl(currentUrl)) {
        await init(); // 첫 로드 시 앱 초기화
    }

    // SPA 대응, 페이지가 변경되지 않더라도 URL이 변경된다면 다시 앱 초기화
    window.navigation.addEventListener("navigate", async (event) => {
        const destUrl = event.destination.url;
        if (destUrl !== currentUrl && isAllowUrl(destUrl)) {
            currentUrl = destUrl;
            await init();
        }
    });
}
