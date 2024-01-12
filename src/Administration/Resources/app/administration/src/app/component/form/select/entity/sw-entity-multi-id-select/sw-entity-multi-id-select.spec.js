/**
 * @package admin
 */

import { mount } from '@vue/test-utils';
import EntityCollection from 'src/core/data/entity-collection.data';
import Criteria from 'src/core/data/criteria.data';
import utils from 'src/core/service/util.service';

const fixture = [
    {
        id: utils.createId(),
        name: 'first entry',
        active: true,
    },
    {
        id: utils.createId(),
        name: 'second entry',
        active: false,
    },
];

function getCollection() {
    return new EntityCollection(
        '/test-entity',
        'testEntity',
        null,
        new Criteria(1, 25),
        fixture,
        fixture.length,
        null,
    );
}
async function createWrapper() {
    return mount(await wrapTestComponent('sw-entity-multi-id-select', { sync: true }), {
        props: {
            ids: getCollection(),
            repository: {
                search: () => {
                    return Promise.resolve(getCollection());
                },
            },
        },
        global: {
            provide: {
                repositoryFactory: {
                    create: () => {
                        return {
                            get: (value) => Promise.resolve({ id: value, name: value }),
                            search: () => {
                                return Promise.resolve();
                            },
                        };
                    },
                },
            },
            stubs: {
                'sw-block-field': true,
                'sw-select-selection-list': true,
                'sw-icon': true,
                'sw-select-base': await wrapTestComponent('sw-select-base'),
                'sw-entity-multi-select': await wrapTestComponent('sw-entity-multi-select'),
            },
        },
    });
}

describe('components/sw-entity-multi-id-select', () => {
    it('should be a Vue.js component', async () => {
        const wrapper = await createWrapper();
        expect(wrapper.vm).toBeTruthy();
    });

    it('should able to update ids', async () => {
        const wrapper = await createWrapper();
        wrapper.vm.updateIds(getCollection());
        await flushPromises();

        expect(wrapper.vm.ids).toHaveLength(fixture.length);
        expect(wrapper.vm.collection).toHaveLength(fixture.length);

        await wrapper.setProps({ ids: [] });
        expect(wrapper.vm.ids).toHaveLength(0);
        expect(wrapper.vm.collection).toHaveLength(0);
    });

    it('should reset selected ids if it is invalid value', async () => {
        const wrapper = await createWrapper();
        wrapper.vm.updateIds = jest.fn();
        await wrapper.setProps(
            {
                ids: [{ id: '123', name: 'random' }],
                repository: {
                    search: () => {
                        return Promise.resolve([]);
                    },
                },
            },
        );

        expect(wrapper.vm.updateIds).toHaveBeenCalled();
    });
});