import {IComment, IUser} from '.';

export interface IGrowthSession {
    id: number;
    title: string;
    topic: string;
    location: string;
    date: string;
    start_time: string;
    end_time: string;
    is_public: boolean;
    attendee_limit: number | null;
    discord_channel_id: string | null;
    owner: IUser;
    attendees: IUser[];
    comments: IComment[];
}
