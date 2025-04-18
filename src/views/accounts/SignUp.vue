<template>
  <div class="container signup-container">
    <h3>
        {{$t('message.JoinSite')}} 
    </h3>

    <div v-if="formSubmitted">
        <p>{{ $t('message.ThankYou') }}</p>
        <p>{{ $t('message.PleaseCheckEmail', form) }}</p>
    </div>

    <div v-if="!formSubmitted">
        <p>
            {{$t('message.JoinSiteDescription')}}
        </p>

        <b-form @submit="onSubmit" ref="form">
            <b-form-group
                :label="$t('message.Name') + '*'"
                label-for="name"
                :state="form.nameState">
                <b-form-input
                    id="nameInput"
                    v-model="form.name"
                    :state="form.nameState"
                    required>
                </b-form-input>
            </b-form-group>

            <b-form-group
                :label="$t('message.Email') + '*'"
                label-for="email"
                :state="form.emailState">
                <b-form-input
                    id="emailInput"
                    v-model="form.email"
                    :state="form.emailState"
                    required>
                </b-form-input>
            </b-form-group>

            <b-form-group
                :label="$t('message.LanguageLabel') + '*'"
                label-for="language">

                <b-form-select 
                    v-model="form.language" 
                    :options="languageOptions">
                </b-form-select>
            </b-form-group>

            <b-form-group
                :label="$t('message.Gender') + '*'">
                <b-form-select 
                    v-model="form.gender" 
                    :options="genderOptions"
                    required>
                </b-form-select>
            </b-form-group>
            
            <b-form-group
                :label="$t('message.BirthYear')">
                <b-form-input
                    id="birthYear"
                    type="number"
                    v-model="form.birthYear">
                </b-form-input>
            </b-form-group>

            <b-form-group
                :label="$t('message.Location')">
                <b-form-input
                    v-model="form.location">
                </b-form-input>
            </b-form-group>

            <div class="text-right">
                <small class="font-italic">* {{$t('message.Required')}}</small>
            </div>

            <b-alert variant="danger" v-model="showError">
                {{ errorMessage }} <br/>
                {{ $t("message.AlreadySignedUp") }}
                <router-link to="/accounts/login/">{{ $t("message.Login") }}</router-link>
            </b-alert>

            <b-button type="submit" variant="primary">{{$t('message.Confirm')}}</b-button>
        </b-form >

        <div class="login">
            <hr/>
            {{ $t("message.AlreadySignedUp") }}
            <router-link to="/accounts/login/">{{ $t("message.Login") }}</router-link>
        </div>
    </div>

    <div class="privacy-policy">
        <router-link to="/privacy_policy/">{{ $t("message.PrivacyPolicy") }}</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import APIException from '@/models/data/api_exception';
import store from '../../store/store';
import ErrorModal from '../../components/common/ErrorModal.vue';
import config from '../../config';
import GenderOptionsBuilder from '../../models/data/gender_options_builder';
import SelectOption from '../../models/data/select_option';
import EmailHelper from '../../models/emailHelper';
import LanguageOptionsBuilder from '../../models/data/language_options_builder';
import { localeMatch } from '../../localization/localization';
import { i18n } from '../../main';

@Component
export default class SignUp extends Vue {

    public genderOptions: SelectOption[] = [];

    public languageOptions: SelectOption[] = [];

    public form: any = {
        name: '',
        nameState: null,
        email: '',
        emailState: null,
        language: 'en',
        gender: 'F',
        birthYear: '',
        location: '',
    };

    public errorMessage: string = '';

    public get showError(): boolean {
        return this.errorMessage.length > 0;
    }

    public formSubmitted: boolean = false;

    public async onSubmit(evt: Event) {
        evt.preventDefault();
        // window.console.log(`OnSubmit() called`);
        // window.console.log(this.form);

        this.errorMessage = '';

        if (!EmailHelper.validateEmail(this.form.email)) {
            this.errorMessage = this.$t('message.InvalidEmail').toString();
            return;
        }

        try {
            store.commit('updateLoading', true);

            const options: AxiosRequestConfig = {
                url: `${config.BaseApiUrl}${config.SignUpAPI}`,
                data: {
                    name: this.form.name,
                    email: this.form.email,
                    gender: this.form.gender,
                    birth_year: this.form.birthYear,
                    address: this.form.location,
                    language: this.form.language,
                },
                method: 'POST',
                responseType: 'text',
            };

            await axios.request(options);
            this.formSubmitted = true;

        } catch (error) {
            const axiosError = error as AxiosError<APIException>;
            const message =  axiosError?.response?.data?.detail || (error as Error).toString();
            if (message.includes('Email in Use')) {
                this.errorMessage = this.$t('message.EmailInUse').toString();
            } else {
                this.errorMessage = (error as Error).toString();
            }
        }

        store.commit('updateLoading', false);
    }

    protected mounted() {
        i18n.locale = localeMatch.match(navigator.language);
        this.languageOptions = LanguageOptionsBuilder.createDropDownOptions();
        const genderBuilder = new GenderOptionsBuilder(this);
        this.genderOptions = genderBuilder.createDropDownOptions();
    }

    @Watch('form.language')
    private languageChanged() {
        i18n.locale = localeMatch.match(this.form.language);
        const genderBuilder = new GenderOptionsBuilder(this);
        this.genderOptions = genderBuilder.createDropDownOptions();
    }
}
</script>

<style scoped>
    .signup-container {
        max-width: 600px;
        padding: 15px;
        margin: 0 auto;
    }

    .login {
        opacity: 0.85;
        max-width: 330px;
        margin-top: 50px;
        padding: 15px;
        margin: 0 auto;
        text-align: center;
    }

    .privacy-policy {
        text-align: center;
        font-size: small;
    }
</style>
