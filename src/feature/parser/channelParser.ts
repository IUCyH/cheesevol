import Channel from "../../domain/channel";

class ChannelParser {

    parseChannel(informationDetail: Element): Channel {
        const id = this.parseChannelId(informationDetail);
        const name = this.parseChannelName(informationDetail);
        const profileUrl = this.parseChannelProfileUrl(informationDetail);
        return new Channel(id, name, profileUrl);
    }

    private parseChannelId(informationDetail: Element): string {
        const root = informationDetail.querySelector('div[class^="video_information_name"]');
        const href = root?.querySelector('a[class^="video_information_link"]')?.getAttribute('href');
        if (!root || !href) {
            throw new Error("Channel ID not found");
        }

        return href.replace(/\//g, '').trim();
    }

    private parseChannelName(informationDetail: Element): string {
        const name = informationDetail.querySelector('span[class^="name_text"]');
        if (!name || !name.textContent) {
            throw new Error("Channel name element not found");
        }

        return name.textContent;
    }

    private parseChannelProfileUrl(informationDetail: Element): string {
        const channelProfile = informationDetail.querySelector<HTMLImageElement>('a[class^="video_information_thumbnail"] img');
        if (!channelProfile) {
            throw new Error("Channel profile element not found");
        }

        return channelProfile.src;
    }
}

export default new ChannelParser();