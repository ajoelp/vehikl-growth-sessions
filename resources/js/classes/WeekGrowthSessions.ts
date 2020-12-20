import {IGrowthSession, IWeekGrowthSessions} from '../types';
import {GrowthSession} from './GrowthSession';
import {DateTime} from '../classes/DateTime';

export class WeekGrowthSessions {
    weekGrowthSessions: IWeekGrowthSessions;
    weekDates: DateTime[] = [];

    constructor(weekMobs: IWeekGrowthSessions) {
        this.weekGrowthSessions = weekMobs;
        let weekDateStrings = Object.keys(weekMobs);
        for (let weekDate of weekDateStrings) {
            this.weekGrowthSessions[weekDate] = weekMobs[weekDate].map((jsonMob: IGrowthSession) => new GrowthSession(jsonMob));
            this.weekDates.push(DateTime.parseByDate(weekDate))
        }
    }

    get allMobs(): GrowthSession[] {
        let mobs = [];
        for (let weekDate of this.weekDates) {
            mobs.push(...this.weekGrowthSessions[weekDate.toDateString()]);
        }
        return mobs as GrowthSession[];
    }

    getSessionByDate(date: DateTime): GrowthSession[] {
        return this.weekGrowthSessions[date.toDateString()] as GrowthSession[];
    }

    get isReady(): boolean {
        const numberOfWeekdays = 5;
        return this.weekDates.length >= numberOfWeekdays;
    }

    get firstDay(): DateTime {
        return this.weekDates[0];
    }

    get lastDay(): DateTime {
        return this.weekDates[this.weekDates.length - 1];
    }

    static empty(): WeekGrowthSessions {
        return new WeekGrowthSessions({[DateTime.today().toDateString()] : []});
    }
}
