import {createLocalVue, mount, Wrapper} from '@vue/test-utils';
import GrowthSessionForm from './GrowthSessionForm.vue';
import {IStoreGrowthSessionRequest, IUser} from '../types';
import flushPromises from 'flush-promises';
import {GrowthSessionApi} from '../services/GrowthSessionApi';
import vSelect from 'vue-select';
import {IDiscordChannel} from "../types/IDiscordChannel";
import {DiscordChannelApi} from "../services/DiscordChannelApi";
import growthSessionWithCommentsJson from '../../../tests/fixtures/GrowthSessionWithComments.json';

const localVue = createLocalVue();
localVue.component('v-select', vSelect)

const user: IUser = {
    avatar: 'lastAirBender.jpg',
    github_nickname: 'jackjack',
    id: 987,
    name: 'Jack Bauer',
    is_vehikl_member: true,
};
const discordChannels: Array<IDiscordChannel> = [
    {
        name: 'Chat One',
        id: '1234567890',
    },
    {
        name: 'Chat Two',
        id: '1234567891',
    }
];
const startDate: string = "2020-06-25";


describe('GrowthSessionForm', () => {
    let wrapper: Wrapper<GrowthSessionForm>;

    beforeEach(() => {
        GrowthSessionApi.store = jest.fn().mockImplementation(growthSession => growthSession);
        GrowthSessionApi.update = jest.fn().mockImplementation(growthSession => growthSession);
        DiscordChannelApi.index = jest.fn().mockImplementation(() => discordChannels);
        wrapper = mount(GrowthSessionForm, {propsData: {owner: user, startDate}, localVue});
    });

    const baseGrowthSessionRequest: IStoreGrowthSessionRequest = {
        location: 'The growth session location',
        topic: 'Chosen topic',
        title: 'Chosen title',
        date: '2020-10-01',
        start_time: '4:45 pm',
        discord_channel_id: undefined
    }
    describe('used for creation', () => {

        describe('allows a growth session to be created', () => {
            type TGrowthSessionCreationScenario = [string, IStoreGrowthSessionRequest]

            const scenarios: TGrowthSessionCreationScenario[] = [
                [
                    'Can accept no limit and no end time',
                    {...baseGrowthSessionRequest, attendee_limit: undefined, end_time: undefined}
                ],
                [
                    'Can accept a limit',
                    {
                        ...baseGrowthSessionRequest,
                        attendee_limit: 4
                    }
                ],
                [
                    'Can accept an end time',
                    {
                        ...baseGrowthSessionRequest,
                        end_time: '5:45 pm',
                    }
                ],
                [
                    'Can accept no Discord channel',
                    {...baseGrowthSessionRequest, discord_channel_id: undefined}
                ],
                [
                    'Can accept a Discord channel',
                    {...baseGrowthSessionRequest, discord_channel_id: '1234567890'}
                ]
            ]

            it.each(scenarios)('%s', async (testTitle, payload) => {
                const {
                    title: chosenTitle,
                    topic: chosenTopic,
                    location: chosenLocation,
                    start_time: chosenStartTime,
                    attendee_limit: chosenLimit,
                    discord_channel_id: discordChannelId,
                } = payload;

                const discordChannel = discordChannels.filter(channel => channel.id === discordChannelId)[0] || undefined;

                await flushPromises();

                window.confirm = jest.fn();

                wrapper.vm.$data.startTime = chosenStartTime;
                wrapper.find('#title').setValue(chosenTitle);
                wrapper.find('#topic').setValue(chosenTopic);
                wrapper.find('#location').setValue(chosenLocation);

                if (!chosenLimit) {
                    wrapper.findComponent({ref: 'no-limit'}).trigger('click');
                }

                if (chosenLimit) {
                    wrapper.findComponent({ref: 'attendee-limit'}).setValue(chosenLimit);
                }

                if (discordChannel) {
                    wrapper.findComponent(vSelect).vm.$emit('input', {
                        label: discordChannel.name,
                        value: discordChannel.id
                    });
                }

                await wrapper.vm.$nextTick();
                wrapper.find('button[type="submit"]').trigger('click');
                await flushPromises();

                const expectedPayload: IStoreGrowthSessionRequest = {
                    title: chosenTitle,
                    attendee_limit: chosenLimit,
                    location: chosenLocation,
                    date: startDate,
                    start_time: chosenStartTime,
                    end_time: '05:00 pm',
                    topic: chosenTopic,
                    discord_channel_id: discordChannelId
                };

                if (!chosenLimit) {
                    delete expectedPayload.attendee_limit;
                }

                expect(GrowthSessionApi.store).toHaveBeenCalledWith(expect.objectContaining(expectedPayload));
            });
        });

        it('emits submitted event on success', async () => {
            wrapper.vm.$data.startTime = '3:30 pm';
            wrapper.find('#title').setValue('Something');
            wrapper.find('#topic').setValue('Anything');
            wrapper.find('#location').setValue('Anywhere');
            await wrapper.vm.$nextTick();
            wrapper.find('button[type="submit"]').trigger('click');
            await flushPromises();
            expect(wrapper.emitted('submitted')).toBeTruthy();
        });

        it('starts with the submit button disabled', () => {
            expect(wrapper.find('button[type="submit"]').element).toBeDisabled();
        });

        it('enables the submit button when all required fields are filled', async () => {
            wrapper.vm.$data.startTime = '3:30 pm';
            wrapper.find('#title').setValue('Something');
            wrapper.find('#topic').setValue('Anything');
            wrapper.find('#location').setValue('Anywhere');
            await wrapper.vm.$nextTick();
            expect(wrapper.find('button[type="submit"]').element).not.toBeDisabled();
        });

        it('has a no limit checkbox', () => {
            expect(wrapper.findComponent({ref: 'no-limit'}).exists()).toBeTruthy();
        })

        it('hides the attendee limit input, if no limit checkbox is checked', async () => {
            wrapper.findComponent({ref: 'no-limit'}).setChecked(true)
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent({ref: 'attendee-limit'}).exists()).toBeFalsy();
        })

        it('displays a dropdown select with Discord channel names', async () => {
            await flushPromises();
            expect(DiscordChannelApi.index).toHaveBeenCalled();

            const selector = wrapper.find('#discord_channel');
            expect(selector.exists()).toBeTruthy();
            expect(selector.vm.$props.options).toStrictEqual(discordChannels.map(discordChannel => {
                return {
                    label: discordChannel.name,
                    value: discordChannel.id,
                }
            }));
        })

        it('does not display the dropdown select with Discord channel names if no channels are returned', async () => {
            await flushPromises();
            wrapper.setData({discordChannels: []});
            await wrapper.vm.$nextTick();

            expect(wrapper.find('#discord_channel').exists()).toBeFalsy();
        })

        it('autofills the location with the Discord channel when selected', async () => {
            await flushPromises();
            const selector = wrapper.findComponent(vSelect);
            const locationInput = wrapper.find('#location').element as HTMLInputElement;

            expect(locationInput.value).toBeFalsy();

            selector.vm.$emit('input', {label: discordChannels[0].name, value: discordChannels[0].id});
            await wrapper.vm.$nextTick();

            expect(locationInput.value).toBe(`Discord Channel: ${discordChannels[0].name}`);
        })

        it('changes the location when new Discord channel is selected if old location was a Discord channel', async () => {
            await flushPromises();
            const selector = wrapper.findComponent(vSelect);
            const locationInput = wrapper.find('#location').element as HTMLInputElement;

            selector.vm.$emit('input', {label: discordChannels[0].name, value: discordChannels[0].id});
            await wrapper.vm.$nextTick();

            expect(locationInput.value).toBe(`Discord Channel: ${discordChannels[0].name}`);

            selector.vm.$emit('input', {label: discordChannels[1].name, value: discordChannels[1].id});
            await wrapper.vm.$nextTick();

            expect(locationInput.value).toBe(`Discord Channel: ${discordChannels[1].name}`);
        })

        it('allows users to create a public growth session', async () => {
            const growthSessionInformation: IStoreGrowthSessionRequest = {
                location: 'The growth session location',
                topic: 'Chosen topic',
                title: 'Chosen title',
                date: startDate,
                start_time: '4:45 pm',
                is_public: true
            };

            wrapper.find('#title').setValue(growthSessionInformation.title);
            wrapper.find('#topic').setValue(growthSessionInformation.topic);
            wrapper.find('#location').setValue(growthSessionInformation.location);
            wrapper.vm.$data.startTime = growthSessionInformation.start_time;
            wrapper.findComponent({ref: 'is-public'}).setChecked(true)

            await wrapper.vm.$nextTick();

            wrapper.findComponent({ref: 'submit-button'}).trigger('click')

            expect(GrowthSessionApi.store).toHaveBeenCalledWith(expect.objectContaining({is_public: true}));
        })
    })

    describe('used for editing', () => {
        beforeEach(() => {
            wrapper = mount(GrowthSessionForm, {
                propsData: {
                    owner: user,
                    startDate,
                    growthSession: growthSessionWithCommentsJson
                }, localVue
            });
        });

        it('allows is public field to be editable', () => {
            expect(wrapper.findComponent({ref: 'is-public'}).exists()).toBe(true);
        });
    });

});

