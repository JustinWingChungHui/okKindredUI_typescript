<template>

    <div class="controls-container">
        <!--Back link-->
        <p>
            <router-link
                to="/gallery/">
                {{ $t('message.AllGalleries') }}
            </router-link>
            / 
            <router-link
                :to="`/gallery/${galleryId}/`">
                {{ title }}
            </router-link> 
            / {{ page }}
        </p>
        <!-- Title and description -->
        <div class="title-description">
            <h1>
                {{ title }}
            </h1>
            <p>
                {{ description }}
            </p>
        </div>

        <GalleryActionButton 
            :gallery="gallery"
            :selectedImageIds="selectedImageIds"
            @galleryEdited="galleryEdited"
            @imagesDeleted="imagesDeleted"
            @actionButtonClicked="actionButtonClicked"
            @downloadClicked="downloadClicked"/>
    </div>

</template>

<script lang="ts">
import { Component, Vue, Watch, Prop} from 'vue-property-decorator';
import store from '../../store/store';
import config from '../../config';
import Gallery from '../../models/data/gallery';
import EditGallery from '../../components/gallery/EditGallery.vue';
import GalleryActionButton from './GalleryActionButton.vue';

@Component({
  components: {
      EditGallery,
      GalleryActionButton,
  },
})
export default class GalleryHeader extends Vue {

    @Prop({ default: 0 })
    public galleryId?: number;

    @Prop({ default: () => [] })
    public selectedImageIds?: number[];

    public gallery: Gallery | null = null;

    public get page(): number {
        if (this.$route.query.page) {
            return Number(this.$route.query.page);
        } else {
            return 1;
        }
    }

    public get title(): string {
        if (this.gallery) {
            return this.gallery.title;
        } else {
            return '';
        }
    }

    public get description(): string {
        if (this.gallery) {
            return this.gallery.description;
        } else {
            return '';
        }
    }

    public showNoImagesMessage: boolean = false;

    public get loading(): boolean {
        return store.getters.loading;
    }

    public get watchedProps(): string {
        return `${this.page}|${this.galleryId}`;
    }

    @Watch('watchedProps')
    public async loadGalleryData() {
        // window.console.log(`GalleryHeader.loadGalleryData()`);

        try {

            store.commit('updateLoading', true);

            if (!store.state.currentGallery || store.state.currentGallery.id !== this.galleryId) {
                await store.dispatch('loadCurrentGalleryInfo', this.galleryId);
            }

            this.gallery = store.state.currentGallery;

        } catch (ex) {
            store.commit('setErrorMessage', ex);
        }

        store.commit('updateLoading', false);
    }

    private actionButtonClicked(opened: boolean) {
        this.$emit('editModeChanged', opened);
    }

    private editGalleryClicked() {
        // window.console.log(`GalleryHeader.editGalleryClicked()`);

        if (this.gallery) {
            (this.$refs.editGallery as EditGallery).show(this.gallery);
        }
    }

    private async galleryEdited() {
        // window.console.log(`GalleryHeader.galleryEdited()`);

        await this.loadGalleryData();
    }

    private imagesDeleted() {
        this.$emit('imagesDeleted');
    }

    private downloadClicked() {
        this.$emit('downloadClicked');
    }
}
</script>

<style scoped>
.edit-gallery {
    margin-left: 5px;
    cursor: pointer;
    font-size: 0.7em;
}

.controls-container {
    position: relative;
}

.title-description {
    margin-right: 50px;
    overflow-wrap: break-word;
}
</style>
