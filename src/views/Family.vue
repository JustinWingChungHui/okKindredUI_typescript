<template>
<b-card no-body>
    <b-tabs card justified v-model="tabIndex">
        <b-tab @click="route('tree')" active class="no-select-border">
            <template slot="title">
                <span class="oi oi-people" aria-hidden="true"></span>
                {{ $t('message.Tree') }}
            </template>
            <b-card-text>
                <FamilyTree 
                    ref="tree" />
            </b-card-text>
        </b-tab>
        <b-tab @click="route('profile')" class="no-select-border">
            <template slot="title">
                <span class="oi oi-person" aria-hidden="true"></span>
                {{ $t('message.Profile') }}
            </template>
            <b-card-text>
                <Profile 
                    ref="profile" />
            </b-card-text>
        </b-tab>
        <b-tab @click="route('map')" class="no-select-border">
            <template slot="title">
                <span class="oi oi-map" aria-hidden="true"></span>
                {{ $t('message.Map') }}
            </template>
            <b-card-text>
                <FamilyMap 
                    ref="map" />
            </b-card-text>
        </b-tab>
    </b-tabs>
</b-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import FamilyTree from '../components/family_tree/FamilyTree.vue';
import FamilyMap from '../components/FamilyMap.vue';
import Profile from '../components/profile/Profile.vue';
import Person from './../models/data/person';
import Relation from './../models/data/relation';
import store from '../store/store';
import { configs } from '../config';
import ProfileEmitArgs from '../models/profile_emit_args';
import NewPersonResponse from '../models/data/new_person_response';

@Component({
  components: {
    FamilyTree,
    FamilyMap,
    Profile,
  },
})
export default class Family extends Vue {

    @Prop({ default: 'tree' })
    public urlState?: string;

    @Prop({ default: 0 })
    public personId?: string;

    private state: string = '';

    private tabIndex: number = 0;

    private tabIndexByState: { [id: string]: number; } = {
        tree: 0,
        profile: 1,
        map: 2,
    };

    private get selectPersonId(): string {
        return store.state.person_id;
    }

    protected async mounted() {
      // window.console.log('Family.vue mounted() call');
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      await this.initialize();
      document.body.scrollTop = document.documentElement.scrollTop = 0;

      store.dispatch('updateRouteLoaded');
    }

    private route(state: string) {
        this.$router.push(`/family/${state}/${this.personId}/`);
        this.state = state;
    }

    @Watch('selectPersonId')
    private onSelectedPersonIdChange() {
        if (this.personId && this.selectPersonId !== this.personId) {
            this.$router.push(`/family/${this.urlState}/${this.selectPersonId}/`);
        }
    }

    @Watch('personId')
    private async onPersonIdChange() {
        if (this.personId && this.selectPersonId !== this.personId) {
            await store.dispatch('changePerson', this.personId);
        }
    }

    @Watch('urlState')
    private onUrlStateChange() {
        // window.console.log('Family.onUrlStateChange()');
        if (this.urlState && this.urlState !== this.state) {
            const tabIndex = this.tabIndexByState[this.urlState];
            this.tabIndex = tabIndex;
            this.state = this.urlState;
        }
    }

    @Watch('state')
    private onStateChange() {
        // window.console.log('Family.onStateChange()');

        if (store.state.people.length > 0) {
            switch (this.state) {
                case 'tree':
                    const tree = this.$refs.tree as FamilyTree;
                    this.$nextTick(() => tree.initializeTree());
                    break;
                case 'map':
                    const map = this.$refs.map as any;
                    this.$nextTick(() => map.renderMap());
                    break;
                case 'profile':
                    const profile = this.$refs.profile as Profile;
                    this.$nextTick(async () => await profile.initialize());
                    break;
            }
        }
    }

    private async initialize() {
        // window.console.log('Family.initialize()');

        if (!this.urlState) {
            return;
        }

        try {
            // Load jwt from cookie and login
            await store.dispatch('restoreSession');

            if (store.state.people.length === 0) {
                await this.LoadData();
            }

            if (!this.personId) {
                this.$router.replace(`/family/${this.urlState}/${store.state.person_id}/`);
            }

            const tabIndex = this.tabIndexByState[this.urlState];
            this.tabIndex = tabIndex;

            const personInFamily = store.state.people
                        .filter((p) => Number(p.id) === Number(this.personId)).length > 0;

            if (personInFamily) {
                await store.dispatch('changePerson', this.personId);
            } else {
                this.$router.replace(`/family/${this.urlState}/${store.state.person_id}/`);
            }

            this.state = this.urlState;

        } catch (ex) {
            // window.console.log(`ex: ${ex}`);
            this.$router.push(`/accounts/login/?next=${this.$router.currentRoute.fullPath}`);
        }
    }

    private async LoadData() {
        try {
            await store.dispatch('loadTreeData');
        } catch (ex) {
            // window.console.log(ex);
            store.commit('setErrorMessage', ex);
        }
    }
}
</script>

<!-- "scoped" attribute removed to fill screen -->
<style scoped>
.card-body {
    padding: 0.25em !important;
}

.no-select-border {
  /* https://stackoverflow.com/questions/5796512/how-to-disable-select-for-html5-canvas-element */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
}
</style>
