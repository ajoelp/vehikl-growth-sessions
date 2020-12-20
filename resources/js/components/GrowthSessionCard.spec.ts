import {mount, Wrapper} from '@vue/test-utils';
import GrowthSessionCard from './GrowthSessionCard.vue';
import {IUser} from '../types';
import {GrowthSessionApi} from '../services/GrowthSessionApi';
import {DateTime} from '../classes/DateTime';
import {GrowthSession} from '../classes/GrowthSession';

const ownerOfTheGrowthSession: IUser = {
    name: 'Jack Bauer',
    github_nickname: 'jackjack',
    id: 1,
    email: 'jack@bauer.com',
    avatar: 'theLastAirBender.jpg'
};

const attendee: IUser = {
    name: 'Alice',
    github_nickname: 'alisss',
    id: 2,
    email: 'alice@ecila.com',
    avatar: 'avatar.jpg'
};

const outsider: IUser = {
    name: 'Rudolf',
    github_nickname: 'deer123',
    id: 3,
    email: 'red@nose.com',
    avatar: 'avatar.jpg'
};

const growthSessionData: GrowthSession = new GrowthSession({
    id: 0,
    owner: ownerOfTheGrowthSession,
    location: 'Somewhere over the rainbow',
    date: '2020-05-08',
    start_time: '03:30 pm',
    end_time: '05:00 pm',
    title: 'Foobar',
    topic: 'The fundamentals of Foobar',
    attendee_limit: 41,
    attendees: [
        attendee
    ],
    comments: []
});

describe('GrowthSessionCard', () => {
    let wrapper: Wrapper<GrowthSessionCard>;
    beforeEach(() => {
        window.confirm = jest.fn();
        DateTime.setTestNow('2020-05-01 00:00:00.0000');
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData}})
    });

    it('displays the owner name', () => {
        expect(wrapper.text()).toContain(growthSessionData.owner.name);
    });

    it('displays the mob topic', () => {
        expect(wrapper.text()).toContain(growthSessionData.topic);
    });

    it('displays the mob location', () => {
        expect(wrapper.text()).toContain(growthSessionData.location);
    });

    it('displays the number of attendees', () => {
        expect(wrapper.find('.attendees-count').text()).toContain(growthSessionData.attendees.length);
    });

    it('displays the attendee limit', () => {
        expect(wrapper.find('.attendee-limit').text()).toContain(growthSessionData.attendee_limit);
    });

    it('does not display the attendee limit if there is none', () => {
        const noLimitMob = new GrowthSession({...growthSessionData, attendee_limit: null});
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: noLimitMob}})
        // TODO: is there a better way to make sure something isn't displayed in the card??
        expect(wrapper.find('.attendee-limit').element).not.toBeDefined();
    })

    it('does not display the join button to the owner of the mob', () => {
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: ownerOfTheGrowthSession}});
        expect(wrapper.find('.join-button').element).not.toBeVisible();
    });

    it('does not display the join button if you are already part of the mob', () => {
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: attendee}});
        expect(wrapper.find('.join-button').element).not.toBeVisible();
    });

    it('does not display the join button to guests', () => {
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData}});
        expect(wrapper.find('.join-button').element).not.toBeVisible();
    });

    it('does display the join button if you are authenticated and not part of the mob', () => {
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: outsider}});
        expect(wrapper.find('.join-button').element).toBeVisible();
    });

    it('allows a user to join a growth session', () => {
        window.open = jest.fn();
        GrowthSessionApi.join = jest.fn().mockImplementation(mob => mob);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: outsider}});
        wrapper.find('.join-button').trigger('click');
        expect(GrowthSessionApi.join).toHaveBeenCalledWith(growthSessionData);
    });

    it('allows a user to leave a growth session', () => {
        GrowthSessionApi.leave = jest.fn().mockImplementation(mob => mob);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: attendee}});
        wrapper.find('.leave-button').trigger('click');
        expect(GrowthSessionApi.leave).toHaveBeenCalledWith(growthSessionData);
    });

    it('prompts for confirmation when the owner clicks on the delete button', ()=> {
        window.confirm = jest.fn();
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: ownerOfTheGrowthSession}});
        wrapper.find('.delete-button').trigger('click');
        expect(window.confirm).toHaveBeenCalled();
    });

    it('deletes the mob if the user clicks on the delete button and confirms', ()=> {
        GrowthSessionApi.delete = jest.fn();
        window.confirm = jest.fn().mockReturnValue(true);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: ownerOfTheGrowthSession}});
        wrapper.find('.delete-button').trigger('click');
        expect(GrowthSessionApi.delete).toHaveBeenCalledWith(growthSessionData);
    });

    it('does not display the edit button to the owner if the date of the mob is in the past', () => {
        const oneDayAfterTheGrowthSession = DateTime.parseByDate(growthSessionData.date).addDays(1).toISOString();
        DateTime.setTestNow(oneDayAfterTheGrowthSession);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: ownerOfTheGrowthSession}});

        expect(wrapper.find('.delete-button').element).not.toBeVisible()
    });

    it('does not display the edit button to the owner if the date of the mob is in the past', () => {
        const oneDayAfterTheGrowthSession = DateTime.parseByDate(growthSessionData.date).addDays(1).toISOString();
        DateTime.setTestNow(oneDayAfterTheGrowthSession);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: ownerOfTheGrowthSession}});

        expect(wrapper.find('.update-button').element).not.toBeVisible()
    });

    it('does not display the join button if the date of the mob is in the past', () => {
        const oneDayAfterTheGrowthSession = DateTime.parseByDate(growthSessionData.date).addDays(1).toISOString();
        DateTime.setTestNow(oneDayAfterTheGrowthSession);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: outsider}});

        expect(wrapper.find('.join-button').element).not.toBeVisible()
    });

    it('does not display the leave button if the date of the growth session is in the past', () => {
        const oneDayAfterTheGrowthSession = DateTime.parseByDate(growthSessionData.date).addDays(1).toISOString();
        DateTime.setTestNow(oneDayAfterTheGrowthSession);
        wrapper = mount(GrowthSessionCard, {propsData: {growthSession: growthSessionData, user: attendee}});

        expect(wrapper.find('.leave-button').element).not.toBeVisible()
    });
});
