import Channel from "../../domain/channel";

class ChannelParser {

    parseChannel(informationDetail: Element): Channel {
        const id = this.parseChannelId();
        const name = this.parseChannelName(informationDetail);
        const profileUrl = this.parseChannelProfileUrl(informationDetail);
        return new Channel(id, name, profileUrl);
    }

    private parseChannelId(): string {
        const url = location.href;
        const id = url.match(/\/live\/([^\/?]+)/);
        if (!id) {
            throw new Error("Channel ID not found in URL");
        }

        return id[1];
    }

    private parseChannelName(informationDetail: Element): string {
        const nameEl = informationDetail.querySelector('span[class^="name_text"]');
        if (!nameEl) {
            throw new Error("Channel name element not found");
        }

        return nameEl?.textContent?.trim() || "";
    }

    private parseChannelProfileUrl(informationDetail: Element): string {
        const channelProfileEl = informationDetail.querySelector<HTMLImageElement>('a[class^="video_information_thumbnail"] img');
        if (!channelProfileEl) {
            throw new Error("Channel profile element not found");
        }

        return channelProfileEl.src;
    }
}

export default new ChannelParser();