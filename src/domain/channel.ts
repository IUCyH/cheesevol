class Channel {

    private readonly id: string;
    private name: string;
    private profileUrl: string;
    private volume: number;

    constructor(id: string, name: string, profileUrl: string) {
        this.id = id;
        this.name = name;
        this.profileUrl = profileUrl;
        this.volume = 0.0;
    }

    get channelId(): string {
        return this.id;
    }

    get channelName(): string {
        return this.name;
    }

    get channelProfileUrl(): string {
        return this.profileUrl;
    }

    get channelVolume(): number {
        return this.volume;
    }

    get volumePercent(): number {
        return Math.round(this.volume * 100);
    }

    updateVolume(volume: number): void {
        this.volume = volume;
    }

    updateChannelInfo(name: string, profileUrl: string): void {
        this.name = name;
        this.profileUrl = profileUrl;
    }
}

export default Channel;
